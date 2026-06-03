package com.scrumtracker.service;

import com.scrumtracker.dto.SprintDto;
import com.scrumtracker.entity.Sprint;
import com.scrumtracker.entity.User;
import com.scrumtracker.repository.SprintRepository;
import com.scrumtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SprintService {

    @Autowired private SprintRepository sprintRepository;
    @Autowired private UserRepository userRepository;

    public SprintDto.Response createSprint(SprintDto.CreateRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User manager = userRepository.findByUsername(username).orElseThrow();

        Sprint sprint = new Sprint();
        sprint.setName(request.getName());
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());
        sprint.setTotalStoryPoints(request.getTotalStoryPoints());
        sprint.setHoursPerStoryPoint(request.getHoursPerStoryPoint());
        sprint.setCreatedBy(manager);
        sprint.setStatus(Sprint.SprintStatus.ACTIVE);
        sprintRepository.save(sprint);

        return toResponse(sprint);
    }

    public List<SprintDto.Response> getAllSprints() {
        return sprintRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<SprintDto.Response> getActiveSprints() {
        return sprintRepository.findByStatusOrderByStartDateDesc(Sprint.SprintStatus.ACTIVE)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SprintDto.Response getSprintById(Long id) {
        return toResponse(sprintRepository.findById(id).orElseThrow(() -> new RuntimeException("Sprint not found")));
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
        r.setStatus(sprint.getStatus().name());
        r.setCreatedByName(sprint.getCreatedBy().getFullName());
        return r;
    }
}
