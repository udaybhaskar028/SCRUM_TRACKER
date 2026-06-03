package com.scrumtracker.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DailyUpdateDto {

    @Data
    public static class CreateRequest {
        private Long sprintId;
        private String todayWork;
        private String tomorrowPlan;
        private String blockers;
        private Double storyPointsLogged;
        private Double hoursWorked;
        private String privateNotes; // only visible to the owner
    }

    @Data
    public static class UpdateRequest {
        private String todayWork;
        private String tomorrowPlan;
        private String blockers;
        private Double storyPointsLogged;
        private Double hoursWorked;
        private String privateNotes;
    }

    // Public view — no private notes
    @Data
    public static class PublicResponse {
        private Long id;
        private Long userId;
        private String userFullName;
        private String username;
        private LocalDate updateDate;
        private String todayWork;
        private String tomorrowPlan;
        private String blockers;
        private Double storyPointsLogged;
        private Double hoursWorked;
        private LocalDateTime updatedAt;
    }

    // Private view — includes personal notes, only for the owner
    @Data
    public static class PrivateResponse extends PublicResponse {
        private String privateNotes;
    }

    // Summary for dashboard resource utilization
    @Data
    public static class UserSprintSummary {
        private Long userId;
        private String userFullName;
        private String username;
        private Double totalStoryPointsLogged;
        private Double totalHoursWorked;
        private Double remainingStoryPoints;
        private Double utilizationPercent;
        private Integer updatesCount;
    }
}
