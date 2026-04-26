package com.chores.backend.controller;

import com.chores.backend.model.Task;
import com.chores.backend.model.TaskStatus;
import com.chores.backend.service.JsonDatabaseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = "*")
public class ReminderController {
    private final JsonDatabaseService db;

    public ReminderController(JsonDatabaseService db) {
        this.db = db;
    }

    /**
     * Poll to get high severity or delayed tasks for the user.
     * Realistic Reminder Logic based on prompt: "The tasks should have time limit deadline and 
     * based on severity of the task, the reminders should come to the person..."
     */
    @GetMapping("/{userId}")
    public List<Task> getReminders(@PathVariable("userId") String userId) {
        return db.getDatabase().getTasks().stream()
                .filter(t -> userId.equals(t.getAssigneeId()))
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .filter(t -> "HIGH".equalsIgnoreCase(t.getSeverity()) || TaskStatus.DELAYED == t.getStatus())
                .collect(Collectors.toList());
    }
}
