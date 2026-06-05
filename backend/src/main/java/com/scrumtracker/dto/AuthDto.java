package com.scrumtracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class LoginRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank
        @Size(min = 3, max = 50)
        private String username;

        @NotBlank
        @Size(min = 6)
        private String password;

        @NotBlank
        @Email
        private String email;

        @NotBlank
        private String fullName;

        @NotBlank
        private String role; // "MANAGER", "USER", "SUPERADMIN"

        // Optional — user can join a team during registration
        private String inviteCode;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String username;
        private String fullName;
        private String role;
        private Long userId;

        public AuthResponse(String token, String username, String fullName, String role, Long userId) {
            this.token = token;
            this.username = username;
            this.fullName = fullName;
            this.role = role;
            this.userId = userId;
        }
    }
}
