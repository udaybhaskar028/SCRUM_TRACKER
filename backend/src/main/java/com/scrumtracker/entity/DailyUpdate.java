package com.scrumtracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_updates")
@Data
@NoArgsConstructor
public class DailyUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", nullable = false)
    private Sprint sprint;

    @Column(nullable = false)
    private LocalDate updateDate;

    // What was done today (shown on dashboard)
    @Column(columnDefinition = "TEXT")
    private String todayWork;

    // What's planned for tomorrow (shown on dashboard)
    @Column(columnDefinition = "TEXT")
    private String tomorrowPlan;

    // Any blockers (shown on dashboard)
    @Column(columnDefinition = "TEXT")
    private String blockers;

    // Story points logged for today
    @Column(nullable = false)
    private Double storyPointsLogged;

    // Actual hours worked today
    @Column(nullable = false)
    private Double hoursWorked;

    // Private personal notes — NOT shown on dashboard
    @Column(columnDefinition = "TEXT")
    private String privateNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
