package com.scrumtracker.dto;

import lombok.Data;

public class ProfileDto {

    @Data
    public static class UpdateRequest {
        private String fullName;
        private String email;
    }

    @Data
    public static class PasswordChangeRequest {
        private String currentPassword;
        private String newPassword;
    }

    @Data
    public static class Response {
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private String role;
        private String createdAt;
        // Teams the user belongs to
        private java.util.List<String> teamNames;
    }
}
