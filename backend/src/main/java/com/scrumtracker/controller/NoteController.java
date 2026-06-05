package com.scrumtracker.controller;

import com.scrumtracker.dto.NoteDto;
import com.scrumtracker.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired private NoteService noteService;

    @PostMapping
    public ResponseEntity<NoteDto.Response> createNote(@RequestBody NoteDto.CreateRequest request) {
        return ResponseEntity.ok(noteService.createNote(request));
    }

    @GetMapping
    public ResponseEntity<List<NoteDto.Response>> getMyNotes() {
        return ResponseEntity.ok(noteService.getMyNotes());
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteDto.Response> updateNote(@PathVariable Long id,
                                                        @RequestBody NoteDto.UpdateRequest request) {
        return ResponseEntity.ok(noteService.updateNote(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.ok().build();
    }
}
