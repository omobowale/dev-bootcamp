package com.trainingplatform.controller;
import com.trainingplatform.service.*;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequiredArgsConstructor
public class StudentWorkspaceController {
 private final AssignmentDraftService drafts;
 private final StudentWorkspaceService workspace;
 @GetMapping("/api/student/assignments/{id}/draft") public AssignmentDraftService.Draft draft(@PathVariable Long id){return drafts.get(id);}
 @PutMapping("/api/student/assignments/{id}/draft") public AssignmentDraftService.Draft saveDraft(@PathVariable Long id,@Valid @RequestBody AssignmentDraftService.Save body){return drafts.save(id,body);}
 @GetMapping("/api/student/workspace/calendar") public List<StudentWorkspaceService.Event> calendar(@RequestParam Instant from,@RequestParam Instant to){return workspace.calendar(from,to);}
 @GetMapping("/api/student/workspace/notifications") public StudentWorkspaceService.Inbox notifications(){return workspace.notifications();}
 @PostMapping("/api/student/workspace/notifications/read") public void read(@RequestBody List<String> ids){workspace.markRead(ids);}
 @GetMapping("/api/student/workspace/preferences") public StudentWorkspaceService.Preferences preferences(){return workspace.preferences();}
 @PutMapping("/api/student/workspace/preferences") public StudentWorkspaceService.Preferences preferences(@RequestBody StudentWorkspaceService.Preferences body){return workspace.preferences(body);}
}
