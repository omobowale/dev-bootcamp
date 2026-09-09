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
class WorkspaceIT extends AbstractIntegrationTest {
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
 @Test void draftsRubricsCalendarAndNotificationsRespectOwnershipAndVersions()throws Exception{
  jdbc.update("insert into admins(name,email,password_hash) values ('Workspace admin','workspace-admin@example.com','test-hash')");
  String admin=jwt.generateToken("workspace-admin@example.com","ADMIN");
  long course=jdbc.queryForObject("insert into courses(title,slug) values ('Workspace test','workspace-test') returning id",Long.class);
  long module=jdbc.queryForObject("insert into course_modules(course_id,title,position) values (?,'Lessons',1) returning id",Long.class,course);
  long cohort=jdbc.queryForObject("insert into cohorts(course_id,name) values (?,'Cohort A') returning id",Long.class,course);
  long other=jdbc.queryForObject("insert into cohorts(course_id,name) values (?,'Cohort B') returning id",Long.class,course);
  long a=student("WS-A",course,cohort);student("WS-B",course,other);
  String token=jwt.generateToken("WS-A@example.com","STUDENT"),foreign=jwt.generateToken("WS-B@example.com","STUDENT");
  long session=jdbc.queryForObject("insert into class_sessions(module_id,title,position,cohort_id,scheduled_at) values (?,'My live class',1,?,now()+interval '1 hour') returning id",Long.class,module,cohort);
  jdbc.update("insert into class_sessions(module_id,title,position,cohort_id,scheduled_at) values (?,'Private other cohort',2,?,now()+interval '1 hour')",module,other);
  long assignment=jdbc.queryForObject("insert into assignments(class_session_id,title,max_score,due_at) values (?,'Practice task',100,now()+interval '2 hours') returning id",Long.class,session);
  String rubricPath="/api/admin/assignments/"+assignment+"/rubric",draftPath="/api/student/assignments/"+assignment+"/draft";
  var criteria=List.of(Map.of("id","implementation","label","Implementation","maxPoints",60,"description","Working normal and failure cases"),Map.of("id","reasoning","label","Reasoning","maxPoints",40,"description","Explain the design"));
  ok("PUT",rubricPath,Map.of("version",0,"criteria",criteria),admin);
  assertThat(send("PUT",rubricPath,Map.of("version",0,"criteria",criteria),admin).statusCode()).isEqualTo(409);
  assertThat(ok("GET","/api/student/assignments/"+assignment+"/rubric",null,token).get("criteria").size()).isEqualTo(2);
  assertThat(send("GET",draftPath,null,foreign).statusCode()).isEqualTo(403);
  assertThat(ok("GET",draftPath,null,token).get("version").asLong()).isZero();
  ok("PUT",draftPath,Map.of("version",0,"submissionVersion",-1,"responseText","Draft on device A"),token);
  assertThat(send("PUT",draftPath,Map.of("version",0,"submissionVersion",-1,"responseText","Stale device B"),token).statusCode()).isEqualTo(409);
  assertThat(ok("GET",draftPath,null,token).get("responseText").asText()).isEqualTo("Draft on device A");
  ok("PUT",draftPath,Map.of("version",1,"submissionVersion",-1,"responseText","Reconciled text"),token);
  Instant now=Instant.now();String range="?from="+now+"&to="+now.plusSeconds(86400);
  JsonNode calendar=ok("GET","/api/student/workspace/calendar"+range,null,token);
  assertThat(calendar.size()).isEqualTo(2);assertThat(calendar.toString()).doesNotContain("Private other cohort");
  assertThat(send("GET","/api/student/workspace/calendar?from="+now+"&to="+now.plusSeconds(100L*86400),null,token).statusCode()).isEqualTo(400);
  JsonNode inbox=ok("GET","/api/student/workspace/notifications",null,token);assertThat(inbox.get("unreadCount").asLong()).isEqualTo(2);
  String notice=inbox.get("items").get(0).get("id").asText();
  ok("POST","/api/student/workspace/notifications/read",List.of(notice),token);
  assertThat(ok("GET","/api/student/workspace/notifications",null,token).get("unreadCount").asLong()).isEqualTo(1);
  assertThat(send("POST","/api/student/workspace/notifications/read",List.of(notice),foreign).statusCode()).isEqualTo(400);
  ok("PUT","/api/student/workspace/preferences",Map.of("enabled",false,"hoursBefore",24),token);
  assertThat(ok("GET","/api/student/workspace/notifications",null,token).get("items").size()).isZero();
  assertThat(send("PUT","/api/student/workspace/preferences",Map.of("enabled",true,"hoursBefore",3),token).statusCode()).isEqualTo(400);
  var submit=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/student/assignments/"+assignment+"/submit")).header("Authorization","Bearer "+token).header("Content-Type","application/x-www-form-urlencoded").POST(HttpRequest.BodyPublishers.ofString("responseText=Final+response")).build();
  var submitted=client.send(submit,HttpResponse.BodyHandlers.ofString());assertThat(submitted.statusCode()).as(submitted.body()).isEqualTo(200);
  assertThat(jdbc.queryForObject("select count(*) from assignment_drafts where student_id=?",Integer.class,a)).isZero();
  assertThat(send("PUT",draftPath,Map.of("version",2,"submissionVersion",-1,"responseText","Late autosave"),token).statusCode()).isEqualTo(409);
  assertThat(send("PUT",rubricPath,Map.of("version",1,"criteria",criteria),admin).statusCode()).isEqualTo(409);
  long submission=jdbc.queryForObject("select id from assignment_submissions where assignment_id=?",Long.class,assignment);
  var scorecard=List.of(Map.of("id","implementation","points",50,"feedback","Good coverage"),Map.of("id","reasoning","points",35,"feedback","Explain the tradeoff"));
  String reviewPath="/api/admin/assignment-submissions/"+submission+"/review";
  assertThat(send("PUT",reviewPath,Map.of("version",0,"status","REVIEWED","score",100,"feedback","No criterion scores"),admin).statusCode()).isEqualTo(409);
  JsonNode review=ok("PUT",reviewPath,Map.of("version",0,"rubricVersion",1,"status","REVIEWED","score",999,"feedback","Reviewed","criterionScores",scorecard),admin);
  assertThat(review.get("score").asInt()).isEqualTo(85);assertThat(review.get("rubricBreakdown").size()).isEqualTo(2);
  assertThat(ok("GET","/api/student/classes/"+session,null,token).get("assignment").get("mySubmission").get("rubricBreakdown").get(0).get("label").asText()).isEqualTo("Implementation");
  inbox=ok("GET","/api/student/workspace/notifications",null,token);assertThat(inbox.get("items").size()).isEqualTo(1);assertThat(inbox.get("items").get(0).get("kind").asText()).isEqualTo("FEEDBACK");
  jdbc.update("update course_enrollments set active=false where student_id=?",a);
  assertThat(ok("GET","/api/student/workspace/calendar"+range,null,token).size()).isZero();
  assertThat(ok("GET","/api/student/workspace/notifications",null,token).get("items").size()).isZero();
  assertThat(send("GET",draftPath,null,token).statusCode()).isEqualTo(403);
 }
}
