package com.scrumtracker.repository;

import com.scrumtracker.entity.Note;
import com.scrumtracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    // Pinned notes first, then by newest
    List<Note> findByUserOrderByPinnedDescCreatedAtDesc(User user);
    Optional<Note> findByIdAndUser(Long id, User user);
}
