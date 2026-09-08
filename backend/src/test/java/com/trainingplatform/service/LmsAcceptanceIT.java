package com.trainingplatform.service;
import com.trainingplatform.AbstractIntegrationTest;
import com.trainingplatform.entity.Admin;
import com.trainingplatform.repository.AdminRepository;
import java.net.URI;
import java.net.http.*;
import java.nio.file.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.mockito.ArgumentCaptor;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class LmsAcceptanceIT extends AbstractIntegrationTest {
    @LocalServerPort int port;
    @Autowired AdminRepository admins;
    @Autowired PasswordEncoder encoder;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @MockitoBean EmailService email;
    final HttpClient client=HttpClient.newHttpClient();
    String adminToken;
    HttpResponse<String> send(String method,String path,Object body,String token) throws Exception {
        var request=HttpRequest.newBuilder(URI.create("http://localhost:"+port+path)).header("Content-Type","application/json");
        if(token!=null)request.header("Authorization","Bearer "+token);
        request.method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)));
        return client.send(request.build(),HttpResponse.BodyHandlers.ofString());
    }
    JsonNode ok(String method,String path,Object body,String token) throws Exception {
        var response=send(method,path,body,token);
        assertThat(response.statusCode()).as(method+" "+path+": "+response.body()).isBetween(200,299);
        return response.body().isBlank()?mapper.nullNode():mapper.readTree(response.body());
    }
    JsonNode submit(long assignment,long version,String token) throws Exception {
        String form="responseText=My+tested+solution+and+reasoning"+(version<0?"":"&version="+version);
        var request=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/student/assignments/"+assignment+"/submit"))
            .header("Content-Type","application/x-www-form-urlencoded").header("Authorization","Bearer "+token).POST(HttpRequest.BodyPublishers.ofString(form)).build();
        var response=client.send(request,HttpResponse.BodyHandlers.ofString());assertThat(response.statusCode()).as(response.body()).isEqualTo(200);return mapper.readTree(response.body());
    }
    @Test void importsFourDraftsAndCompletesAProtectedStudentJourney() throws Exception {
        Admin admin=new Admin();admin.setName("Acceptance Admin");admin.setEmail("acceptance-admin@example.com");admin.setPasswordHash(encoder.encode("acceptance-password"));admins.save(admin);
        adminToken=ok("POST","/api/admin/login",Map.of("email",admin.getEmail(),"password","acceptance-password"),null).get("token").asText();
        long firstCourse=0,firstModule=0;
        List<Long> sessions=new ArrayList<>(),quizzes=new ArrayList<>(),assignments=new ArrayList<>();
        List<List<Map<String,Object>>> answerSets=new ArrayList<>();
        for(String file:List.of("react","vue","javascript-node","python-django")) {
            JsonNode data=mapper.readTree(Files.readString(Path.of("seed/initial-cohort/"+file+".json")));
            long course=ok("POST","/api/admin/courses",data.get("course"),adminToken).get("id").asLong();
            ok("PUT","/api/admin/courses/"+course+"/completion-criteria",data.get("completionCriteria"),adminToken);
            long module=ok("POST","/api/admin/courses/"+course+"/modules",data.get("module"),adminToken).get("id").asLong();
            boolean first=firstCourse==0;if(first){firstCourse=course;firstModule=module;}
            for(JsonNode lesson:data.get("lessons")) {
                long session=ok("POST","/api/admin/modules/"+module+"/class-sessions",lesson.get("class"),adminToken).get("id").asLong();
                long quiz=ok("POST","/api/admin/class-sessions/"+session+"/quiz",Map.of(),adminToken).get("id").asLong();
                ok("PUT","/api/admin/quizzes/"+quiz+"/settings",lesson.get("quiz").get("settings"),adminToken);
                List<Map<String,Object>> answers=new ArrayList<>();
                for(JsonNode question:lesson.get("quiz").get("questions")) {
                    long questionId=ok("POST","/api/admin/quizzes/"+quiz+"/questions",question,adminToken).get("id").asLong();
                    int correct=0;for(int i=0;i<4;i++)if(question.get("options").get(i).get("correct").asBoolean())correct=i;
                    answers.add(Map.of("questionId",questionId,"selectedOptionPosition",correct));
                }
                long assignment=ok("POST","/api/admin/class-sessions/"+session+"/assignment",Map.of(),adminToken).get("id").asLong();
                ok("PUT","/api/admin/assignments/"+assignment,lesson.get("assignment"),adminToken);
                if(first){sessions.add(session);quizzes.add(quiz);assignments.add(assignment);answerSets.add(answers);}
            }
        }
        assertThat(jdbc.queryForObject("select count(*) from courses where slug like '%-initial-cohort-draft' and is_published=false",Integer.class)).isEqualTo(4);
        assertThat(jdbc.queryForObject("select count(*) from quiz_questions",Integer.class)).isEqualTo(240);
        long cohort=jdbc.queryForObject("insert into cohorts(course_id,name) values (?,?) returning id",Long.class,firstCourse,"Acceptance cohort");
        long otherCohort=jdbc.queryForObject("insert into cohorts(course_id,name) values (?,?) returning id",Long.class,firstCourse,"Other cohort");
        for(long session:sessions)jdbc.update("update class_sessions set cohort_id=? where id=?",cohort,session);
        long foreignSession=ok("POST","/api/admin/modules/"+firstModule+"/class-sessions",Map.of("title","Other cohort private lesson","position",7,"cohortId",otherCohort,"sections",List.of()),adminToken).get("id").asLong();
        long registration=jdbc.queryForObject("insert into registrations(registration_number,full_name,email,whatsapp_number,course_id,cohort_id) values ('ACCEPT-001','Acceptance Student','acceptance-student@example.com','08000000000',?,?) returning id",Long.class,firstCourse,cohort);
        ok("PUT","/api/admin/registrations/"+registration+"/status",Map.of("status","CONFIRMED"),adminToken);
        String invite=jdbc.queryForObject("select invite_token from students where email='acceptance-student@example.com'",String.class);
        long student=jdbc.queryForObject("select id from students where email='acceptance-student@example.com'",Long.class);
        verify(email).sendStudentInvite(any(),anyString(),anyString());
        String token=ok("POST","/api/student/auth/invite/accept",Map.of("token",invite,"password","student-password"),null).get("token").asText();
        assertThat(send("GET","/api/student/classes/"+foreignSession,null,token).statusCode()).isEqualTo(403);
        assertThat(send("GET","/api/student/courses/"+firstCourse+"/overview?cohortId="+otherCohort,null,token).statusCode()).isEqualTo(403);
        assertThat(send("POST","/api/student/courses/"+firstCourse+"/certificate",Map.of(),token).statusCode()).isEqualTo(400);
        for(int i=0;i<sessions.size();i++) {
            long session=sessions.get(i),quiz=quizzes.get(i),assignment=assignments.get(i);
            ok("GET","/api/student/classes/"+session,null,token);
            ok("POST","/api/student/classes/"+session+"/complete",Map.of(),token);
            JsonNode start=ok("POST","/api/student/quizzes/"+quiz+"/attempts",Map.of(),token);
            long attempt=start.get("attemptId").asLong();
            assertThat(start.toString()).doesNotContain("\"correct\"");
            assertThat(ok("POST","/api/student/quizzes/"+quiz+"/attempts",Map.of(),token).get("attemptId").asLong()).isEqualTo(attempt);
            ok("POST","/api/student/quiz-attempts/"+attempt+"/draft",answerSets.get(i).get(0),token);
            assertThat(ok("GET","/api/student/quiz-attempts/"+attempt+"/draft",null,token).size()).isEqualTo(1);
            assertThat(ok("POST","/api/student/quiz-attempts/"+attempt+"/submit",Map.of("answers",answerSets.get(i)),token).get("passed").asBoolean()).isTrue();
            assertThat(ok("GET","/api/student/quiz-attempts/"+attempt,null,token).get("percentage").asDouble()).isEqualTo(100);
            JsonNode submission=submit(assignment,-1,token);long submissionId=ok("GET","/api/admin/assignments/"+assignment+"/submissions",null,adminToken).get(0).get("id").asLong();
            if(i==0) {
                var correction=Map.of("version",submission.get("version").asLong(),"status","NEEDS_RESUBMISSION","score",50,"feedback","Explain the empty case.");
                JsonNode reviewed=ok("PUT","/api/admin/assignment-submissions/"+submissionId+"/review",correction,adminToken);
                assertThat(send("PUT","/api/admin/assignment-submissions/"+submissionId+"/review",correction,adminToken).statusCode()).isEqualTo(409);
                submission=submit(assignment,reviewed.get("version").asLong(),token);
                assertThat(submission.get("score").isNull()).isTrue();
                assertThat(ok("GET","/api/student/assignments/"+assignment+"/history",null,token).size()).isEqualTo(1);
            }
            ok("PUT","/api/admin/assignment-submissions/"+submissionId+"/review",Map.of("version",submission.get("version").asLong(),"status","REVIEWED","score",90,"feedback","Evidence accepted."),adminToken);
            ok("PUT","/api/admin/class-sessions/"+session+"/attendance",Map.of("entries",List.of(Map.of("studentId",student,"status","PRESENT"))),adminToken);
        }
        JsonNode overview=ok("GET","/api/student/courses/"+firstCourse+"/overview?cohortId="+cohort,null,token);
        assertThat(overview.get("progress").get("courseComplete").asBoolean()).isTrue();
        assertThat(overview.get("quizResults").size()).isEqualTo(6);
        JsonNode certificate=ok("POST","/api/student/courses/"+firstCourse+"/certificate",Map.of(),token);
        ok("GET","/api/certificates/verify/"+certificate.get("verificationId").asText(),null,null);
        ok("POST","/api/student/auth/recovery",Map.of("email","acceptance-student@example.com"),null);
        var link=ArgumentCaptor.forClass(String.class);verify(email).sendStudentRecovery(any(),link.capture());
        String resetToken=link.getValue().substring(link.getValue().lastIndexOf('/')+1);
        ok("POST","/api/student/auth/reset-password",Map.of("token",resetToken,"password","replacement-password"),null);
        assertThat(send("GET","/api/student/me",null,token).statusCode()).isEqualTo(401);
        assertThat(send("POST","/api/student/auth/reset-password",Map.of("token",resetToken,"password","another-password"),null).statusCode()).isEqualTo(400);
        token=ok("POST","/api/student/auth/login",Map.of("email","acceptance-student@example.com","password","replacement-password"),null).get("token").asText();
        ok("PUT","/api/admin/registrations/"+registration+"/status",Map.of("status","CANCELLED"),adminToken);
        assertThat(send("GET","/api/student/classes/"+sessions.get(0),null,token).statusCode()).isEqualTo(403);
        assertThat(send("GET","/api/admin/grading?status=INVALID",null,adminToken).statusCode()).isEqualTo(400);
    }
}
