package com.scrumtracker.service;

import com.scrumtracker.dto.ProfileDto;
import com.scrumtracker.entity.User;
import com.scrumtracker.repository.TeamMemberRepository;
import com.scrumtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    @Autowired private UserRepository userRepository;
    @Autowired private TeamMemberRepository teamMemberRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    public ProfileDto.Response getProfile() {
        User user = getCurrentUser();
        return toResponse(user);
    }

    public ProfileDto.Response updateProfile(ProfileDto.UpdateRequest request) {
        User user = getCurrentUser();
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        return toResponse(userRepository.save(user));
    }

    public void changePassword(ProfileDto.PasswordChangeRequest request) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (request.getNewPassword().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private ProfileDto.Response toResponse(User user) {
        ProfileDto.Response r = new ProfileDto.Response();
        r.setId(user.getId());
        r.setUsername(user.getUsername());
        r.setFullName(user.getFullName());
        r.setEmail(user.getEmail());
        r.setRole(user.getRole().name());
        r.setCreatedAt(user.getCreatedAt().toString());
        r.setTeamNames(
            teamMemberRepository.findByUser(user).stream()
                .map(tm -> tm.getTeam().getName())
                .collect(Collectors.toList())
        );
        return r;
    }
}
