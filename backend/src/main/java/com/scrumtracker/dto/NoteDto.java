package com.scrumtracker.dto;

import lombok.Data;
import java.time.LocalDateTime;

public class NoteDto {

    @Data
    public static class CreateRequest {
        private String title;
        private String content;
        private String color; // YELLOW, BLUE, GREEN, PINK, PURPLE, ORANGE
        private Boolean pinned;
    }

    @Data
    public static class UpdateRequest {
        private String title;
        private String content;
        private String color;
        private Boolean pinned;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private String content;
        private String color;
        private Boolean pinned;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
