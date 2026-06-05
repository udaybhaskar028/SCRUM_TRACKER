package com.scrumtracker.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

public class TeamDto {

    @Data
    public static class CreateRequest {
        private String name;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String inviteCode;
        private String managerName;
        private Long managerId;
        private int memberCount;
        private LocalDateTime createdAt;
    }

    @Data
    public static class MemberResponse {
        private Long id;
        private Long userId;
        private String fullName;
        private String username;
        private String email;
        private String status;
        private LocalDateTime joinedAt;
    }

    @Data
    public static class JoinRequest {
        private String inviteCode;
    }

    @Data
    public static class AddByEmailRequest {
        private String email;
        private Long teamId;
    }

    @Data
    public static class UnassignedUserResponse {
        private Long id;
        private String fullName;
        private String username;
        private String email;
    }
}
