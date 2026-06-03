package com.scrumtracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sprints")
@Data
@NoArgsConstructor
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    // Total story points for this sprint
    @Column(nullable = false)
    private Integer totalStoryPoints;

    // Hours per story point (baseline set by manager)
    @Column(nullable = false)
    private Double hoursPerStoryPoint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SprintStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = SprintStatus.ACTIVE;
    }

    public enum SprintStatus {
        ACTIVE, COMPLETED, UPCOMING
    }
}
