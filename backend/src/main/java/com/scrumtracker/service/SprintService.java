package com.scrumtracker.service;

import com.scrumtracker.dto.SprintDto;
import com.scrumtracker.entity.Sprint;
import com.scrumtracker.entity.Team;
import com.scrumtracker.entity.TeamMember;
import com.scrumtracker.entity.User;
import com.scrumtracker.repository.SprintRepository;
import com.scrumtracker.repository.TeamMemberRepository;
import com.scrumtracker.repository.TeamRepository;
import com.scrumtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SprintService {

    @Autowired private SprintRepository sprintRepository;
    @Autowired private TeamRepository teamRepository;
    @Autowired private TeamMemberRepository teamMemberRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    public SprintDto.Response createSprint(SprintDto.CreateRequest request) {
        User manager = getCurrentUser();
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        Sprint sprint = new Sprint();
        sprint.setName(request.getName());
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());
        sprint.setTotalStoryPoints(request.getTotalStoryPoints());
        sprint.setHoursPerStoryPoint(request.getHoursPerStoryPoint());
        sprint.setGoal(request.getGoal());
        sprint.setTeam(team);
        sprint.setCreatedBy(manager);
        sprint.setStatus(Sprint.SprintStatus.ACTIVE);
        return toResponse(sprintRepository.save(sprint));
    }

    // Get all sprints accessible to the current user (via their teams)
    public List<SprintDto.Response> getSprintsForCurrentUser() {
        User user = getCurrentUser();

        // SUPERADMIN sees everything
        if (user.getRole() == User.Role.SUPERADMIN) {
            return sprintRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
        }

        // Manager sees sprints for their teams
        if (user.getRole() == User.Role.MANAGER) {
            List<Team> myTeams = teamRepository.findByManager(user);
            List<SprintDto.Response> result = new ArrayList<>();
            myTeams.forEach(t -> result.addAll(
                sprintRepository.findByTeamOrderByStartDateDesc(t).stream()
                    .map(this::toResponse).collect(Collectors.toList())
            ));
            return result;
        }

        // USER sees sprints for teams they belong to
        List<Team> memberTeams = teamMemberRepository.findByUser(user).stream()
                .filter(tm -> tm.getStatus() == TeamMember.MemberStatus.ACTIVE)
                .map(TeamMember::getTeam)
                .collect(Collectors.toList());

        List<SprintDto.Response> result = new ArrayList<>();
        memberTeams.forEach(t -> result.addAll(
            sprintRepository.findByTeamOrderByStartDateDesc(t).stream()
                .map(this::toResponse).collect(Collectors.toList())
        ));
        return result;
    }

    public List<SprintDto.Response> getActiveSprintsForUser() {
        return getSprintsForCurrentUser().stream()
                .filter(s -> s.getStatus().equals("ACTIVE"))
                .collect(Collectors.toList());
    }

    public SprintDto.Response getSprintById(Long id) {
        return toResponse(sprintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint not found")));
    }

    public SprintDto.Response updateSprintStatus(Long id, String status) {
        Sprint sprint = sprintRepository.findById(id).orElseThrow();
        sprint.setStatus(Sprint.SprintStatus.valueOf(status.toUpperCase()));
        return toResponse(sprintRepository.save(sprint));
    }

    private SprintDto.Response toResponse(Sprint sprint) {
        SprintDto.Response r = new SprintDto.Response();
        r.setId(sprint.getId());
        r.setName(sprint.getName());
        r.setStartDate(sprint.getStartDate());
        r.setEndDate(sprint.getEndDate());
        r.setTotalStoryPoints(sprint.getTotalStoryPoints());
        r.setHoursPerStoryPoint(sprint.getHoursPerStoryPoint());
        r.setGoal(sprint.getGoal());
        r.setStatus(sprint.getStatus().name());
        r.setCreatedByName(sprint.getCreatedBy().getFullName());
        r.setTeamId(sprint.getTeam().getId());
        r.setTeamName(sprint.getTeam().getName());
        long days = ChronoUnit.DAYS.between(sprint.getStartDate(), sprint.getEndDate());
        r.setSprintDays((int) days);
        r.setTotalCapacityHours(sprint.getTotalStoryPoints() * sprint.getHoursPerStoryPoint());
        return r;
    }
}
