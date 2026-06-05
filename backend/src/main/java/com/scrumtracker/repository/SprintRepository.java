package com.scrumtracker.repository;

import com.scrumtracker.entity.Sprint;
import com.scrumtracker.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByTeamOrderByStartDateDesc(Team team);
    List<Sprint> findByTeamAndStatusOrderByStartDateDesc(Team team, Sprint.SprintStatus status);
}
