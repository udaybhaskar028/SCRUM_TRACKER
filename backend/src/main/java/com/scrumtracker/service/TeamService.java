package com.scrumtracker.service;

import com.scrumtracker.dto.TeamDto;
import com.scrumtracker.entity.Team;
import com.scrumtracker.entity.TeamMember;
import com.scrumtracker.entity.User;
import com.scrumtracker.repository.TeamMemberRepository;
import com.scrumtracker.repository.TeamRepository;
import com.scrumtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamService {

    @Autowired private TeamRepository teamRepository;
    @Autowired private TeamMemberRepository teamMemberRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    // Manager creates a team
    public TeamDto.Response createTeam(TeamDto.CreateRequest request) {
        User manager = getCurrentUser();
        Team team = new Team();
        team.setName(request.getName());
        team.setManager(manager);
        return toResponse(teamRepository.save(team));
    }

    // Get all teams managed by the current manager
    public List<TeamDto.Response> getMyTeams() {
        User manager = getCurrentUser();
        return teamRepository.findByManager(manager)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Get all teams current user is a member of
    public List<TeamDto.Response> getMyMemberships() {
        User user = getCurrentUser();
        return teamMemberRepository.findByUser(user)
                .stream()
                .filter(tm -> tm.getStatus() == TeamMember.MemberStatus.ACTIVE)
                .map(tm -> toResponse(tm.getTeam()))
                .collect(Collectors.toList());
    }

    // User joins a team via invite code
    public TeamDto.Response joinByCode(TeamDto.JoinRequest request) {
        User user = getCurrentUser();
        Team team = teamRepository.findByInviteCode(request.getInviteCode().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        if (teamMemberRepository.existsByTeamAndUser(team, user)) {
            throw new RuntimeException("You are already a member of this team");
        }

        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUser(user);
        member.setStatus(TeamMember.MemberStatus.ACTIVE);
        teamMemberRepository.save(member);
        return toResponse(team);
    }

    // Manager adds a user by email
    public TeamDto.MemberResponse addMemberByEmail(TeamDto.AddByEmailRequest request) {
        User manager = getCurrentUser();
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getManager().getId().equals(manager.getId())) {
            throw new RuntimeException("You are not the manager of this team");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No user found with that email"));

        if (teamMemberRepository.existsByTeamAndUser(team, user)) {
            throw new RuntimeException("User is already a member of this team");
        }

        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUser(user);
        member.setStatus(TeamMember.MemberStatus.ACTIVE);
        return toMemberResponse(teamMemberRepository.save(member));
    }

    // Get members of a team (manager only)
    public List<TeamDto.MemberResponse> getTeamMembers(Long teamId) {
        Team team = teamRepository.findById(teamId).orElseThrow();
        return teamMemberRepository.findByTeam(team)
                .stream().map(this::toMemberResponse).collect(Collectors.toList());
    }

    // Get unassigned users (not in any of manager's teams)
    public List<TeamDto.UnassignedUserResponse> getUnassignedUsers() {
        User manager = getCurrentUser();
        return teamMemberRepository.findUnassignedUsersForManager(manager)
                .stream().map(u -> {
                    TeamDto.UnassignedUserResponse r = new TeamDto.UnassignedUserResponse();
                    r.setId(u.getId());
                    r.setFullName(u.getFullName());
                    r.setUsername(u.getUsername());
                    r.setEmail(u.getEmail());
                    return r;
                }).collect(Collectors.toList());
    }

    // Remove a member from team
    public void removeMember(Long teamId, Long userId) {
        User manager = getCurrentUser();
        Team team = teamRepository.findById(teamId).orElseThrow();
        if (!team.getManager().getId().equals(manager.getId())) {
            throw new RuntimeException("Not authorized");
        }
        User user = userRepository.findById(userId).orElseThrow();
        TeamMember tm = teamMemberRepository.findByTeamAndUser(team, user).orElseThrow();
        tm.setStatus(TeamMember.MemberStatus.REMOVED);
        teamMemberRepository.save(tm);
    }

    // Check if current user is in a team (for sprint access)
    public boolean currentUserHasTeam() {
        User user = getCurrentUser();
        List<TeamMember> memberships = teamMemberRepository.findByUser(user);
        return memberships.stream().anyMatch(tm -> tm.getStatus() == TeamMember.MemberStatus.ACTIVE);
    }

    // Get all teams (SUPERADMIN only)
    public List<TeamDto.Response> getAllTeams() {
        return teamRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    private TeamDto.Response toResponse(Team t) {
        TeamDto.Response r = new TeamDto.Response();
        r.setId(t.getId());
        r.setName(t.getName());
        r.setInviteCode(t.getInviteCode());
        r.setManagerName(t.getManager().getFullName());
        r.setManagerId(t.getManager().getId());
        r.setMemberCount(teamMemberRepository.findByTeam(t).size());
        r.setCreatedAt(t.getCreatedAt());
        return r;
    }

    private TeamDto.MemberResponse toMemberResponse(TeamMember tm) {
        TeamDto.MemberResponse r = new TeamDto.MemberResponse();
        r.setId(tm.getId());
        r.setUserId(tm.getUser().getId());
        r.setFullName(tm.getUser().getFullName());
        r.setUsername(tm.getUser().getUsername());
        r.setEmail(tm.getUser().getEmail());
        r.setStatus(tm.getStatus().name());
        r.setJoinedAt(tm.getJoinedAt());
        return r;
    }
}
