package com.chores.backend.controller;

import com.chores.backend.model.Task;
import com.chores.backend.model.TaskStatus;
import com.chores.backend.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskService.createTask(task);
    }

    @GetMapping("/household/{hhId}")
    public List<Task> getTasks(@PathVariable("hhId") String hhId) {
        return taskService.getTasksByHousehold(hhId);
    }

    @PatchMapping("/{taskId}/status")
    public Task updateStatus(@PathVariable("taskId") String taskId, @RequestBody Map<String, String> body) {
        return taskService.updateTaskStatus(taskId, TaskStatus.valueOf(body.get("status")));
    }

    @PatchMapping("/{taskId}/assign")
    public Task assignTask(@PathVariable("taskId") String taskId, @RequestBody Map<String, String> body) {
        return taskService.assignTask(taskId, body.get("assigneeId"));
    }

    @PatchMapping("/{taskId}/stop-recurrence")
    public Task stopRecurrence(@PathVariable("taskId") String taskId) {
        return taskService.stopRecurrence(taskId);
    }

    @DeleteMapping("/{taskId}")
    public void deleteTask(@PathVariable("taskId") String taskId) {
        taskService.deleteTask(taskId);
    }
}
