package com.scrumtracker.dto;

import lombok.Data;
import java.time.LocalDate;

public class SprintDto {

    @Data
    public static class CreateRequest {
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer totalStoryPoints;
        private Double hoursPerStoryPoint;
        private String goal;
        private Long teamId;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer totalStoryPoints;
        private Double hoursPerStoryPoint;
        private String goal;
        private String status;
        private String createdByName;
        private Long teamId;
        private String teamName;
        private Integer sprintDays;
        private Double totalCapacityHours;
    }
}
