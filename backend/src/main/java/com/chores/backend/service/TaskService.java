package com.chores.backend.service;

import com.chores.backend.model.Task;
import com.chores.backend.model.TaskStatus;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import com.chores.backend.model.User;

@Service
public class TaskService {
    private final JsonDatabaseService db;
    private final AiChatService aiService;

    public TaskService(JsonDatabaseService db, AiChatService aiService) {
        this.db = db;
        this.aiService = aiService;
    }

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
                    
                    // AI Metadata for recurring tasks
                    nextTask.setDifficulty(aiService.calculateDifficulty(nextTask.getTitle()));
                    nextTask.setCategory(aiService.categorizeTask(nextTask.getTitle()));
                    autoAssignTask(nextTask);

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

        // AI Intelligence Layer
        if (task.getDifficulty() <= 0) {
            task.setDifficulty(aiService.calculateDifficulty(task.getTitle()));
        }
        if (task.getCategory() == null || task.getCategory().isEmpty()) {
            task.setCategory(aiService.categorizeTask(task.getTitle()));
        }

        // Autonomous Assignment Logic
        if (task.getAssigneeId() == null || task.getAssigneeId().isEmpty()) {
            autoAssignTask(task);
        }

        db.getDatabase().getTasks().add(task);
        db.save();
        return task;
    }

    private void autoAssignTask(Task task) {
        List<User> householdUsers = db.getDatabase().getUsers().stream()
                .filter(u -> u.getHouseholdIds().contains(task.getHouseholdId()))
                .collect(Collectors.toList());

        if (householdUsers.isEmpty()) return;

        // Calculate weekly workload for each user
        Map<String, Integer> workloadMap = new HashMap<>();
        for (User user : householdUsers) {
            // Check if user has vetoed this category
            if (user.getAvoidCategories() != null && user.getAvoidCategories().contains(task.getCategory())) {
                workloadMap.put(user.getId(), Integer.MAX_VALUE); // Avoid this user
                continue;
            }

            int weeklyPoints = db.getDatabase().getTasks().stream()
                    .filter(t -> user.getId().equals(t.getAssigneeId()))
                    .mapToInt(Task::getDifficulty)
                    .sum();
            workloadMap.put(user.getId(), weeklyPoints);
        }

        // Find user with minimum points
        String bestUser = workloadMap.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(householdUsers.get(0).getId());

        // If everyone is vetoed, just pick the first person to avoid failure
        if (workloadMap.get(bestUser) == Integer.MAX_VALUE) {
            bestUser = householdUsers.get(0).getId();
        }

        task.setAssigneeId(bestUser);
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

    public Task updateTaskStatus(String taskId, TaskStatus status, String completedById) {
        Task task = db.getDatabase().getTasks().stream()
                .filter(t -> t.getId().equals(taskId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        if (status == TaskStatus.COMPLETED) {
            task.setCompletedById(completedById);
            task.setCompletedAt(LocalDate.now().toString());
        } else {
            task.setCompletedById(null);
            task.setCompletedAt(null);
        }
        db.save();
        return task;
    }

    public List<Map<String, Object>> getLeaderboard(String householdId) {
        Map<String, Integer> pointsMap = new HashMap<>();
        
        for (Task task : db.getDatabase().getTasks()) {
            if (task.getHouseholdId().equals(householdId) && task.getStatus() == TaskStatus.COMPLETED && task.getCompletedById() != null) {
                int points = task.getDifficulty() > 0 ? task.getDifficulty() * 10 : 10;
                pointsMap.put(task.getCompletedById(), pointsMap.getOrDefault(task.getCompletedById(), 0) + points);
            }
        }

        List<Map<String, Object>> leaderboard = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : pointsMap.entrySet()) {
            String userId = entry.getKey();
            User user = db.getDatabase().getUsers().stream().filter(u -> u.getId().equals(userId)).findFirst().orElse(null);
            if (user != null) {
                Map<String, Object> userPoints = new HashMap<>();
                userPoints.put("userId", userId);
                userPoints.put("username", user.getUsername());
                userPoints.put("points", entry.getValue());
                leaderboard.add(userPoints);
            }
        }

        // Sort by points descending
        leaderboard.sort((m1, m2) -> ((Integer) m2.get("points")).compareTo((Integer) m1.get("points")));
        return leaderboard;
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

    public Task vetoTask(String taskId, String userId) {
        Task task = db.getDatabase().getTasks().stream()
                .filter(t -> t.getId().equals(taskId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        User user = db.getDatabase().getUsers().stream()
                .filter(u -> u.getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Add to avoid categories
        if (!user.getAvoidCategories().contains(task.getCategory())) {
            user.getAvoidCategories().add(task.getCategory());
        }

        // Re-assign task
        task.setAssigneeId(null);
        autoAssignTask(task);
        
        db.save();
        return task;
    }

    public void clearAvoidCategories(String userId) {
        User user = db.getDatabase().getUsers().stream()
                .filter(u -> u.getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.getAvoidCategories().clear();
        db.save();
    }
}
