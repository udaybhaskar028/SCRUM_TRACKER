package com.scrumtracker.repository;

import com.scrumtracker.entity.DailyUpdate;
import com.scrumtracker.entity.Sprint;
import com.scrumtracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyUpdateRepository extends JpaRepository<DailyUpdate, Long> {

    List<DailyUpdate> findByUserAndSprintOrderByUpdateDateDesc(User user, Sprint sprint);

    List<DailyUpdate> findBySprintAndUpdateDateOrderByUserAsc(Sprint sprint, LocalDate date);

    Optional<DailyUpdate> findByUserAndUpdateDate(User user, LocalDate date);

    List<DailyUpdate> findBySprintOrderByUpdateDateDesc(Sprint sprint);

    @Query("SELECT SUM(d.storyPointsLogged) FROM DailyUpdate d WHERE d.user = :user AND d.sprint = :sprint")
    Double sumStoryPointsByUserAndSprint(@Param("user") User user, @Param("sprint") Sprint sprint);

    @Query("SELECT SUM(d.hoursWorked) FROM DailyUpdate d WHERE d.user = :user AND d.sprint = :sprint")
    Double sumHoursByUserAndSprint(@Param("user") User user, @Param("sprint") Sprint sprint);

    @Query("SELECT SUM(d.storyPointsLogged) FROM DailyUpdate d WHERE d.sprint = :sprint")
    Double sumStoryPointsBySprint(@Param("sprint") Sprint sprint);
}
