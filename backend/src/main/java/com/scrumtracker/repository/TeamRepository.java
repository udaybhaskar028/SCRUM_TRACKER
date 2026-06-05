package com.scrumtracker.repository;

import com.scrumtracker.entity.Team;
import com.scrumtracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByManager(User manager);
    Optional<Team> findByInviteCode(String inviteCode);
    boolean existsByInviteCode(String inviteCode);
}
