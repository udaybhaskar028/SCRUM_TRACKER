package com.scrumtracker.controller;

import com.scrumtracker.dto.SprintDto;
import com.scrumtracker.service.SprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    @Autowired
    private SprintService sprintService;

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<SprintDto.Response> createSprint(@RequestBody SprintDto.CreateRequest request) {
        return ResponseEntity.ok(sprintService.createSprint(request));
    }

    @GetMapping
    public ResponseEntity<List<SprintDto.Response>> getAllSprints() {
        return ResponseEntity.ok(sprintService.getAllSprints());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SprintDto.Response>> getActiveSprints() {
        return ResponseEntity.ok(sprintService.getActiveSprints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SprintDto.Response> getSprintById(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.getSprintById(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<SprintDto.Response> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(sprintService.updateSprintStatus(id, status));
    }
}
