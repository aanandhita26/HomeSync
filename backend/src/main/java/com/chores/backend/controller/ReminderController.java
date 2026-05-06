package com.chores.backend.controller;

import com.chores.backend.model.Task;
import com.chores.backend.model.TaskStatus;
import com.chores.backend.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = "*")
public class ReminderController {
    private final TaskService taskService;

    public ReminderController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/{userId}")
    public List<Task> getReminders(@PathVariable("userId") String userId) {
        return taskService.getReminders(userId);
    }
}
