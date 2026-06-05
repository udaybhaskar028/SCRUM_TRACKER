package com.scrumtracker.repository;

import com.scrumtracker.entity.Team;
import com.scrumtracker.entity.TeamMember;
import com.scrumtracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    List<TeamMember> findByTeam(Team team);

    List<TeamMember> findByUser(User user);

    Optional<TeamMember> findByTeamAndUser(Team team, User user);

    boolean existsByTeamAndUser(Team team, User user);

    // Get all users who are NOT in any team (unassigned)
    @Query("SELECT u FROM User u WHERE u.role = 'USER' AND u NOT IN " +
           "(SELECT tm.user FROM TeamMember tm WHERE tm.team.manager = :manager)")
    List<User> findUnassignedUsersForManager(@Param("manager") User manager);

    List<TeamMember> findByTeamAndStatus(Team team, TeamMember.MemberStatus status);
}
