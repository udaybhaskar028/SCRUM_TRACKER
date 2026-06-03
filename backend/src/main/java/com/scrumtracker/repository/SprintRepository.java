package com.scrumtracker.repository;

import com.scrumtracker.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByStatusOrderByStartDateDesc(Sprint.SprintStatus status);
    Optional<Sprint> findTopByStatusOrderByStartDateDesc(Sprint.SprintStatus status);
}
