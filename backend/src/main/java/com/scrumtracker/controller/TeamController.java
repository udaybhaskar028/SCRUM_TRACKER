package com.scrumtracker.controller;

import com.scrumtracker.dto.TeamDto;
import com.scrumtracker.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    @Autowired private TeamService teamService;

    // Manager creates a team
    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<TeamDto.Response> createTeam(@RequestBody TeamDto.CreateRequest request) {
        return ResponseEntity.ok(teamService.createTeam(request));
    }

    // Manager gets their own teams
    @GetMapping("/my")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<TeamDto.Response>> getMyTeams() {
        return ResponseEntity.ok(teamService.getMyTeams());
    }

    // User gets teams they are a member of
    @GetMapping("/memberships")
    public ResponseEntity<List<TeamDto.Response>> getMyMemberships() {
        return ResponseEntity.ok(teamService.getMyMemberships());
    }

    // User joins a team via invite code
    @PostMapping("/join")
    public ResponseEntity<TeamDto.Response> joinByCode(@RequestBody TeamDto.JoinRequest request) {
        return ResponseEntity.ok(teamService.joinByCode(request));
    }

    // Manager adds a member by email
    @PostMapping("/add-member")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<TeamDto.MemberResponse> addMemberByEmail(@RequestBody TeamDto.AddByEmailRequest request) {
        return ResponseEntity.ok(teamService.addMemberByEmail(request));
    }

    // Get members of a specific team
    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamDto.MemberResponse>> getTeamMembers(@PathVariable Long teamId) {
        return ResponseEntity.ok(teamService.getTeamMembers(teamId));
    }

    // Manager sees unassigned users
    @GetMapping("/unassigned")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<TeamDto.UnassignedUserResponse>> getUnassigned() {
        return ResponseEntity.ok(teamService.getUnassignedUsers());
    }

    // Remove a member
    @DeleteMapping("/{teamId}/members/{userId}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> removeMember(@PathVariable Long teamId, @PathVariable Long userId) {
        teamService.removeMember(teamId, userId);
        return ResponseEntity.ok().build();
    }

    // Check if current user has a team (for sprint access gate)
    @GetMapping("/has-team")
    public ResponseEntity<Boolean> hasTeam() {
        return ResponseEntity.ok(teamService.currentUserHasTeam());
    }

    // SUPERADMIN sees all teams
    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<TeamDto.Response>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }
}
