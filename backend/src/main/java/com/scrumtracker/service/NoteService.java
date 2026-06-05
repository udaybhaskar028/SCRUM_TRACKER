package com.scrumtracker.service;

import com.scrumtracker.dto.NoteDto;
import com.scrumtracker.entity.Note;
import com.scrumtracker.entity.User;
import com.scrumtracker.repository.NoteRepository;
import com.scrumtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    @Autowired private NoteRepository noteRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    public NoteDto.Response createNote(NoteDto.CreateRequest request) {
        User user = getCurrentUser();
        Note note = new Note();
        note.setUser(user);
        note.setTitle(request.getTitle() != null ? request.getTitle() : "Untitled");
        note.setContent(request.getContent());
        note.setColor(request.getColor() != null ? request.getColor() : "YELLOW");
        note.setPinned(request.getPinned() != null ? request.getPinned() : false);
        return toResponse(noteRepository.save(note));
    }

    public List<NoteDto.Response> getMyNotes() {
        User user = getCurrentUser();
        return noteRepository.findByUserOrderByPinnedDescCreatedAtDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public NoteDto.Response updateNote(Long id, NoteDto.UpdateRequest request) {
        User user = getCurrentUser();
        Note note = noteRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        if (request.getTitle() != null) note.setTitle(request.getTitle());
        if (request.getContent() != null) note.setContent(request.getContent());
        if (request.getColor() != null) note.setColor(request.getColor());
        if (request.getPinned() != null) note.setPinned(request.getPinned());
        return toResponse(noteRepository.save(note));
    }

    public void deleteNote(Long id) {
        User user = getCurrentUser();
        Note note = noteRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        noteRepository.delete(note);
    }

    private NoteDto.Response toResponse(Note n) {
        NoteDto.Response r = new NoteDto.Response();
        r.setId(n.getId());
        r.setTitle(n.getTitle());
        r.setContent(n.getContent());
        r.setColor(n.getColor());
        r.setPinned(n.getPinned());
        r.setCreatedAt(n.getCreatedAt());
        r.setUpdatedAt(n.getUpdatedAt());
        return r;
    }
}
