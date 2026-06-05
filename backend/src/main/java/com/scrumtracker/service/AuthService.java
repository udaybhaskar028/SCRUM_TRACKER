package com.scrumtracker.service;

import com.scrumtracker.dto.AuthDto;
import com.scrumtracker.entity.Team;
import com.scrumtracker.entity.TeamMember;
import com.scrumtracker.entity.User;
import com.scrumtracker.repository.TeamMemberRepository;
import com.scrumtracker.repository.TeamRepository;
import com.scrumtracker.repository.UserRepository;
import com.scrumtracker.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private TeamRepository teamRepository;
    @Autowired private TeamMemberRepository teamMemberRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private UserDetailsService userDetailsService;

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtils.generateToken(userDetails);
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        return new AuthDto.AuthResponse(token, user.getUsername(), user.getFullName(), user.getRole().name(), user.getId());
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));
        userRepository.save(user);

        // If invite code provided, join that team automatically
        if (request.getInviteCode() != null && !request.getInviteCode().isBlank()) {
            teamRepository.findByInviteCode(request.getInviteCode().toUpperCase())
                    .ifPresent(team -> {
                        if (!teamMemberRepository.existsByTeamAndUser(team, user)) {
                            TeamMember member = new TeamMember();
                            member.setTeam(team);
                            member.setUser(user);
                            member.setStatus(TeamMember.MemberStatus.ACTIVE);
                            teamMemberRepository.save(member);
                        }
                    });
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtils.generateToken(userDetails);
        return new AuthDto.AuthResponse(token, user.getUsername(), user.getFullName(), user.getRole().name(), user.getId());
    }
}
