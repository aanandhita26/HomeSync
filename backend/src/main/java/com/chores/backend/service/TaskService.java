package com.chores.backend.service;

import com.chores.backend.model.Task;
import com.chores.backend.model.TaskStatus;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private final JsonDatabaseService db;

    public TaskService(JsonDatabaseService db) {
        this.db = db;
    }

    // Run every hour to check for recurring tasks (in a real app, logic would be more precise)
    @Scheduled(fixedRate = 3600000)
    public void processRecurringTasks() {
        LocalDate today = LocalDate.now();
        List<Task> newTasks = new ArrayList<>();
        
        for (Task task : db.getDatabase().getTasks()) {
            if (task.isRecurring() && task.getRecurrenceFrequency() != null) {
                String lastDateStr = task.getLastRecurrenceDate();
                LocalDate lastDate = (lastDateStr == null) ? LocalDate.MIN : LocalDate.parse(lastDateStr);
                
                boolean shouldCreate = false;
                switch (task.getRecurrenceFrequency()) {
                    case "DAILY":
                        if (lastDate.isBefore(today)) shouldCreate = true;
                        break;
                    case "WEEKLY":
                        if (lastDate.plusWeeks(1).isBefore(today) || lastDate.plusWeeks(1).isEqual(today)) shouldCreate = true;
                        break;
                    case "MONTHLY":
                        if (lastDate.plusMonths(1).isBefore(today) || lastDate.plusMonths(1).isEqual(today)) shouldCreate = true;
                        break;
                }
                
                if (shouldCreate) {
                    Task nextTask = new Task();
                    nextTask.setId(UUID.randomUUID().toString());
                    nextTask.setTitle(task.getTitle());
                    nextTask.setDescription(task.getDescription());
                    nextTask.setHouseholdId(task.getHouseholdId());
                    nextTask.setSeverity(task.getSeverity());
                    nextTask.setStatus(TaskStatus.OPEN);
                    nextTask.setDeadline(today.toString());
                    newTasks.add(nextTask);
                    
                    task.setLastRecurrenceDate(today.toString());
                }
            }
        }
        
        if (!newTasks.isEmpty()) {
            db.getDatabase().getTasks().addAll(newTasks);
            db.save();
        }
    }

    public Task createTask(Task task) {
        task.setId(UUID.randomUUID().toString());
        if (task.getStatus() == null) task.setStatus(TaskStatus.OPEN);
        if (task.isRecurring()) {
            task.setLastRecurrenceDate(LocalDate.now().toString());
        }
        db.getDatabase().getTasks().add(task);
        db.save();
        return task;
    }

    public Task stopRecurrence(String taskId) {
        Task task = db.getDatabase().getTasks().stream()
                .filter(t -> t.getId().equals(taskId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setRecurring(false);
        db.save();
        return task;
    }

    public List<Task> getTasksByHousehold(String householdId) {
        return db.getDatabase().getTasks().stream()
                .filter(t -> t.getHouseholdId().equals(householdId))
                .collect(Collectors.toList());
    }

    public Task updateTaskStatus(String taskId, TaskStatus status) {
        Task task = db.getDatabase().getTasks().stream()
                .filter(t -> t.getId().equals(taskId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        db.save();
        return task;
    }

    public Task assignTask(String taskId, String assigneeId) {
        Task task = db.getDatabase().getTasks().stream()
                .filter(t -> t.getId().equals(taskId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setAssigneeId(assigneeId);
        db.save();
        return task;
    }

    public void deleteTask(String taskId) {
        db.getDatabase().getTasks().removeIf(t -> t.getId().equals(taskId));
        db.save();
    }
}
