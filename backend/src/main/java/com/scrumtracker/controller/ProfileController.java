package com.scrumtracker.controller;

import com.scrumtracker.dto.ProfileDto;
import com.scrumtracker.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired private ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileDto.Response> getProfile() {
        return ResponseEntity.ok(profileService.getProfile());
    }

    @PutMapping
    public ResponseEntity<ProfileDto.Response> updateProfile(@RequestBody ProfileDto.UpdateRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ProfileDto.PasswordChangeRequest request) {
        profileService.changePassword(request);
        return ResponseEntity.ok("Password changed successfully");
    }
}
