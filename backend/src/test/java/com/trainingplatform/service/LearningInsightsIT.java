package com.trainingplatform.service;
import com.trainingplatform.AbstractIntegrationTest;
import com.trainingplatform.security.JwtService;
import java.net.URI;
import java.net.http.*;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;
import static org.assertj.core.api.Assertions.*;
class LearningInsightsIT extends AbstractIntegrationTest {
 @LocalServerPort int port;
 @org.springframework.test.context.bean.override.mockito.MockitoBean EmailService email;
 @Autowired JdbcTemplate jdbc;
 @Autowired JwtService jwt;
 @Autowired ObjectMapper mapper;
 final HttpClient client=HttpClient.newHttpClient();
 HttpResponse<String> send(String method,String path,Object body,String token)throws Exception{
  var request=HttpRequest.newBuilder(URI.create("http://localhost:"+port+path)).header("Content-Type","application/json").header("Authorization","Bearer "+token);
  request.method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)));
  return client.send(request.build(),HttpResponse.BodyHandlers.ofString());
 }
 JsonNode ok(String method,String path,Object body,String token)throws Exception{var r=send(method,path,body,token);assertThat(r.statusCode()).as(method+" "+path+": "+r.body()).isBetween(200,299);return r.body().isBlank()?mapper.nullNode():mapper.readTree(r.body());}
 long student(String code,long course,long cohort){
  long id=jdbc.queryForObject("insert into students(student_id,full_name,email,status,password_hash) values (?,?,?,'ACTIVE','test-hash') returning id",Long.class,code,code,code+"@example.com");
  long registration=jdbc.queryForObject("insert into registrations(registration_number,full_name,email,whatsapp_number,course_id,cohort_id,status) values (?,?,?,'000',?,?,'CONFIRMED') returning id",Long.class,code,code,code+"@example.com",course,cohort);
  jdbc.update("insert into course_enrollments(student_id,course_id,cohort_id,registration_id) values (?,?,?,?)",id,course,cohort,registration);return id;
 }

 @Test void analyticsAndPreviewAreScopedReadOnlyAndAdminOnly()throws Exception {
  jdbc.update("insert into admins(name,email,password_hash) values ('Insights admin','insights@example.com','test-hash')");
  String admin=jwt.generateToken("insights@example.com","ADMIN");
  long course=jdbc.queryForObject("insert into courses(title,slug) values ('Insights test','insights-test') returning id",Long.class);
  long module=jdbc.queryForObject("insert into course_modules(course_id,title,position) values (?,'Lessons',1) returning id",Long.class,course);
  long cohort=jdbc.queryForObject("insert into cohorts(course_id,name) values (?,'Alpha') returning id",Long.class,course);
  long other=jdbc.queryForObject("insert into cohorts(course_id,name) values (?,'Beta') returning id",Long.class,course);
  long learner=student("INS-A",course,cohort);student("INS-B",course,other);
  long inactive=student("INS-OFF",course,cohort);jdbc.update("update course_enrollments set active=false where student_id=?",inactive);
  long cancelled=student("INS-CANCEL",course,cohort);jdbc.update("update registrations set status='CANCELLED' where email='INS-CANCEL@example.com'");
  long shared=jdbc.queryForObject("insert into class_sessions(module_id,title,position) values (?,'Shared reading',1) returning id",Long.class,module);
  long privateLesson=jdbc.queryForObject("insert into class_sessions(module_id,title,position,cohort_id) values (?,'Beta workshop',2,?) returning id",Long.class,module,other);
  jdbc.update("insert into assignments(class_session_id,title,max_score,due_at) values (?,'Shared task',100,now()-interval '1 day')",shared);
  jdbc.update("insert into assignments(class_session_id,title,max_score,due_at) values (?,'Beta task',100,now()-interval '1 day')",privateLesson);
  jdbc.update("insert into class_completions(class_session_id,student_id) values (?,?)",shared,learner);
  long quiz=jdbc.queryForObject("insert into quizzes(class_session_id) values (?) returning id",Long.class,shared);
  long question=jdbc.queryForObject("insert into quiz_questions(quiz_id,text,explanation,position) values (?,'A question','SECRET ANSWER EXPLANATION',0) returning id",Long.class,quiz);
  jdbc.update("insert into quiz_question_options(quiz_question_id,position,text,is_correct) values (?,0,'Option A',true)",question);
  jdbc.update("insert into quiz_attempts(quiz_id,student_id,submitted_at,passed) values (?,?,now(),true)",quiz,learner);
  jdbc.update("insert into quiz_attempts(quiz_id,student_id,submitted_at,passed) values (?,?,now(),false)",quiz,learner);
  String path="/api/admin/learning/analytics?courseId="+course;
  var all=ok("GET",path,null,admin).get("courses").get(0);
  assertThat(all.get("learners").asInt()).isEqualTo(2);assertThat(all.get("recent").asInt()).isEqualTo(1);
  assertThat(all.get("overdue").asInt()).isEqualTo(3);assertThat(all.get("attempts").asInt()).isEqualTo(2);assertThat(all.get("passed").asInt()).isEqualTo(1);
  var alpha=ok("GET",path+"&cohortId="+cohort,null,admin).get("courses").get(0);
  assertThat(alpha.get("learners").asInt()).isEqualTo(1);assertThat(alpha.get("overdue").asInt()).isEqualTo(1);
  assertThat(ok("GET",path+"&cohortId="+other,null,admin).get("courses").get(0).get("attempts").asInt()).isZero();
  String previewPath="/api/admin/learning/classes/"+shared+"/preview";
  var preview=ok("GET",previewPath,null,admin);
  assertThat(preview.toString()).doesNotContain("SECRET ANSWER EXPLANATION","isCorrect","correct");
  assertThat(preview.get("questions").size()).isEqualTo(1);
  assertThat(preview.get("lesson").get("assignment").get("mySubmission").isNull()).isTrue();
  assertThat(ok("GET","/api/admin/learning/courses/"+course+"/preview",null,admin).get("lessons").size()).isEqualTo(2);
  assertThat(jdbc.queryForObject("select count(*) from quiz_attempts where quiz_id=?",Integer.class,quiz)).isEqualTo(2);
  assertThat(jdbc.queryForObject("select count(*) from class_completions where student_id=?",Integer.class,learner)).isEqualTo(1);
  String studentToken=jwt.generateToken("INS-A@example.com","STUDENT");
  assertThat(send("GET",previewPath,null,studentToken).statusCode()).isEqualTo(403);
  assertThat(send("GET",path,null,studentToken).statusCode()).isEqualTo(403);
  assertThat(send("GET",path,null,"").statusCode()).isIn(401,403);
  assertThat(send("GET","/api/admin/learning/classes/99999999/preview",null,admin).statusCode()).isEqualTo(404);
 }
}
