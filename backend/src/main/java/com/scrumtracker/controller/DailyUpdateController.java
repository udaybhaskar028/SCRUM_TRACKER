package com.scrumtracker.controller;

import com.scrumtracker.dto.DailyUpdateDto;
import com.scrumtracker.service.DailyUpdateService;
import com.scrumtracker.service.ExcelExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/updates")
public class DailyUpdateController {

    @Autowired private DailyUpdateService dailyUpdateService;
    @Autowired private ExcelExportService excelExportService;

    // User submits/updates their daily standup
    @PostMapping
    public ResponseEntity<DailyUpdateDto.PrivateResponse> saveUpdate(@RequestBody DailyUpdateDto.CreateRequest request) {
        return ResponseEntity.ok(dailyUpdateService.createOrUpdate(request));
    }

    // User gets their own updates (includes private notes)
    @GetMapping("/my/{sprintId}")
    public ResponseEntity<List<DailyUpdateDto.PrivateResponse>> getMyUpdates(@PathVariable Long sprintId) {
        return ResponseEntity.ok(dailyUpdateService.getMyUpdatesForSprint(sprintId));
    }

    // Today's update for current user (used to pre-fill form)
    @GetMapping("/my/today/{sprintId}")
    public ResponseEntity<DailyUpdateDto.PrivateResponse> getTodayUpdate(@PathVariable Long sprintId) {
        DailyUpdateDto.PrivateResponse update = dailyUpdateService.getMyTodayUpdate(sprintId);
        if (update == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(update);
    }

    // Dashboard: public standup for a given date across all team members
    @GetMapping("/dashboard/{sprintId}")
    public ResponseEntity<List<DailyUpdateDto.PublicResponse>> getDashboard(
            @PathVariable Long sprintId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(dailyUpdateService.getDashboardForDate(sprintId, targetDate));
    }

    // Resource utilization summary for manager dashboard
    @GetMapping("/summary/{sprintId}")
    public ResponseEntity<List<DailyUpdateDto.UserSprintSummary>> getSprintSummary(@PathVariable Long sprintId) {
        return ResponseEntity.ok(dailyUpdateService.getSprintSummary(sprintId));
    }

    // Manager can edit any update (edit mode on dashboard)
    @PutMapping("/{id}/manager")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<DailyUpdateDto.PublicResponse> managerEdit(
            @PathVariable Long id,
            @RequestBody DailyUpdateDto.UpdateRequest request) {
        return ResponseEntity.ok(dailyUpdateService.managerUpdateEntry(id, request));
    }

    // Export sprint to Excel
    @GetMapping("/export/{sprintId}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<byte[]> exportToExcel(@PathVariable Long sprintId) throws IOException {
        byte[] data = excelExportService.exportSprintToExcel(sprintId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "sprint-" + sprintId + "-report.xlsx");
        return ResponseEntity.ok().headers(headers).body(data);
    }
}
