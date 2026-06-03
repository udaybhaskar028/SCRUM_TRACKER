package com.scrumtracker.service;

import com.scrumtracker.dto.DailyUpdateDto;
import com.scrumtracker.entity.DailyUpdate;
import com.scrumtracker.entity.Sprint;
import com.scrumtracker.entity.User;
import com.scrumtracker.repository.DailyUpdateRepository;
import com.scrumtracker.repository.SprintRepository;
import com.scrumtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DailyUpdateService {

    @Autowired private DailyUpdateRepository dailyUpdateRepository;
    @Autowired private SprintRepository sprintRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    public DailyUpdateDto.PrivateResponse createOrUpdate(DailyUpdateDto.CreateRequest request) {
        User user = getCurrentUser();
        Sprint sprint = sprintRepository.findById(request.getSprintId())
                .orElseThrow(() -> new RuntimeException("Sprint not found"));

        // Check if today's update exists — update it if so
        DailyUpdate update = dailyUpdateRepository.findByUserAndUpdateDate(user, LocalDate.now())
                .orElse(new DailyUpdate());

        update.setUser(user);
        update.setSprint(sprint);
        update.setUpdateDate(LocalDate.now());
        update.setTodayWork(request.getTodayWork());
        update.setTomorrowPlan(request.getTomorrowPlan());
        update.setBlockers(request.getBlockers());
        update.setStoryPointsLogged(request.getStoryPointsLogged());
        update.setHoursWorked(request.getHoursWorked());
        update.setPrivateNotes(request.getPrivateNotes());

        return toPrivateResponse(dailyUpdateRepository.save(update));
    }

    public DailyUpdateDto.PrivateResponse getMyTodayUpdate(Long sprintId) {
        User user = getCurrentUser();
        return dailyUpdateRepository.findByUserAndUpdateDate(user, LocalDate.now())
                .map(this::toPrivateResponse)
                .orElse(null);
    }

    public List<DailyUpdateDto.PrivateResponse> getMyUpdatesForSprint(Long sprintId) {
        User user = getCurrentUser();
        Sprint sprint = sprintRepository.findById(sprintId).orElseThrow();
        return dailyUpdateRepository.findByUserAndSprintOrderByUpdateDateDesc(user, sprint)
                .stream().map(this::toPrivateResponse).collect(Collectors.toList());
    }

    // Dashboard — public view for a specific date (manager or all members can see today's standup)
    public List<DailyUpdateDto.PublicResponse> getDashboardForDate(Long sprintId, LocalDate date) {
        Sprint sprint = sprintRepository.findById(sprintId).orElseThrow();
        return dailyUpdateRepository.findBySprintAndUpdateDateOrderByUserAsc(sprint, date)
                .stream().map(this::toPublicResponse).collect(Collectors.toList());
    }

    // Resource utilization per user in a sprint — for manager dashboard
    public List<DailyUpdateDto.UserSprintSummary> getSprintSummary(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId).orElseThrow();
        List<User> allUsers = userRepository.findAll();

        return allUsers.stream()
                .filter(u -> u.getRole() == User.Role.USER)
                .map(user -> {
                    DailyUpdateDto.UserSprintSummary summary = new DailyUpdateDto.UserSprintSummary();
                    summary.setUserId(user.getId());
                    summary.setUserFullName(user.getFullName());
                    summary.setUsername(user.getUsername());

                    Double logged = dailyUpdateRepository.sumStoryPointsByUserAndSprint(user, sprint);
                    Double hours = dailyUpdateRepository.sumHoursByUserAndSprint(user, sprint);
                    logged = logged != null ? logged : 0.0;
                    hours = hours != null ? hours : 0.0;

                    double totalSP = sprint.getTotalStoryPoints();
                    double remaining = Math.max(0, totalSP - logged);
                    double utilization = totalSP > 0 ? (logged / totalSP) * 100 : 0;

                    summary.setTotalStoryPointsLogged(logged);
                    summary.setTotalHoursWorked(hours);
                    summary.setRemainingStoryPoints(remaining);
                    summary.setUtilizationPercent(Math.min(100, utilization));

                    List<DailyUpdate> updates = dailyUpdateRepository.findByUserAndSprintOrderByUpdateDateDesc(user, sprint);
                    summary.setUpdatesCount(updates.size());

                    return summary;
                }).collect(Collectors.toList());
    }

    // Manager updates a public update (edit mode)
    public DailyUpdateDto.PublicResponse managerUpdateEntry(Long id, DailyUpdateDto.UpdateRequest request) {
        DailyUpdate update = dailyUpdateRepository.findById(id).orElseThrow();
        update.setTodayWork(request.getTodayWork());
        update.setTomorrowPlan(request.getTomorrowPlan());
        update.setBlockers(request.getBlockers());
        update.setStoryPointsLogged(request.getStoryPointsLogged());
        update.setHoursWorked(request.getHoursWorked());
        return toPublicResponse(dailyUpdateRepository.save(update));
    }

    private DailyUpdateDto.PublicResponse toPublicResponse(DailyUpdate d) {
        DailyUpdateDto.PublicResponse r = new DailyUpdateDto.PublicResponse();
        r.setId(d.getId());
        r.setUserId(d.getUser().getId());
        r.setUserFullName(d.getUser().getFullName());
        r.setUsername(d.getUser().getUsername());
        r.setUpdateDate(d.getUpdateDate());
        r.setTodayWork(d.getTodayWork());
        r.setTomorrowPlan(d.getTomorrowPlan());
        r.setBlockers(d.getBlockers());
        r.setStoryPointsLogged(d.getStoryPointsLogged());
        r.setHoursWorked(d.getHoursWorked());
        r.setUpdatedAt(d.getUpdatedAt());
        return r;
    }

    private DailyUpdateDto.PrivateResponse toPrivateResponse(DailyUpdate d) {
        DailyUpdateDto.PrivateResponse r = new DailyUpdateDto.PrivateResponse();
        r.setId(d.getId());
        r.setUserId(d.getUser().getId());
        r.setUserFullName(d.getUser().getFullName());
        r.setUsername(d.getUser().getUsername());
        r.setUpdateDate(d.getUpdateDate());
        r.setTodayWork(d.getTodayWork());
        r.setTomorrowPlan(d.getTomorrowPlan());
        r.setBlockers(d.getBlockers());
        r.setStoryPointsLogged(d.getStoryPointsLogged());
        r.setHoursWorked(d.getHoursWorked());
        r.setUpdatedAt(d.getUpdatedAt());
        r.setPrivateNotes(d.getPrivateNotes());
        return r;
    }
}
