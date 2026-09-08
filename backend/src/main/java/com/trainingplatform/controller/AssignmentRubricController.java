package com.trainingplatform.controller;
import com.trainingplatform.service.AssignmentRubricService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequiredArgsConstructor
public class AssignmentRubricController {
 private final AssignmentRubricService rubric;
 @GetMapping("/api/admin/assignments/{id}/rubric") public AssignmentRubricService.Document admin(@PathVariable Long id){return rubric.get(id,false);}
 @GetMapping("/api/student/assignments/{id}/rubric") public AssignmentRubricService.Document student(@PathVariable Long id){return rubric.get(id,true);}
 @PutMapping("/api/admin/assignments/{id}/rubric") public AssignmentRubricService.Document save(@PathVariable Long id,@Valid @RequestBody AssignmentRubricService.Save request){return rubric.save(id,request);}
}
