package com.chores.backend.service;

import com.chores.backend.model.Task;
import com.chores.backend.model.TaskStatus;
import com.chores.backend.model.User;
import com.chores.backend.repository.TaskRepository;
import com.chores.backend.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final AiChatService aiService;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository, AiChatService aiService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    @Scheduled(fixedRate = 3600000)
    public void processRecurringTasks() {
        LocalDate today = LocalDate.now();
        List<Task> newTasks = new ArrayList<>();
        List<Task> tasksToUpdate = new ArrayList<>();
        
        for (Task task : taskRepository.findAll()) {
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
                    
                    nextTask.setDifficulty(aiService.calculateDifficulty(nextTask.getTitle()));
                    nextTask.setCategory(aiService.categorizeTask(nextTask.getTitle()));
                    autoAssignTask(nextTask);

                    newTasks.add(nextTask);
                    task.setLastRecurrenceDate(today.toString());
                    tasksToUpdate.add(task);
                }
            }
        }
        
        if (!newTasks.isEmpty()) {
            taskRepository.saveAll(newTasks);
        }
        if (!tasksToUpdate.isEmpty()) {
            taskRepository.saveAll(tasksToUpdate);
        }
    }

    public Task createTask(Task task) {
        task.setId(UUID.randomUUID().toString());
        if (task.getStatus() == null) task.setStatus(TaskStatus.OPEN);
        if (task.isRecurring()) {
            task.setLastRecurrenceDate(LocalDate.now().toString());
        }

        if (task.getDifficulty() <= 0) {
            task.setDifficulty(aiService.calculateDifficulty(task.getTitle()));
        }
        if (task.getCategory() == null || task.getCategory().isEmpty()) {
            task.setCategory(aiService.categorizeTask(task.getTitle()));
        }

        if (task.getAssigneeId() == null || task.getAssigneeId().isEmpty()) {
            autoAssignTask(task);
        }

        return taskRepository.save(task);
    }

    private void autoAssignTask(Task task) {
        // Query by householdId in mongo
        List<User> householdUsers = userRepository.findAll().stream()
                .filter(u -> u.getHouseholdIds().contains(task.getHouseholdId()))
                .collect(Collectors.toList());

        if (householdUsers.isEmpty()) return;

        Map<String, Integer> workloadMap = new HashMap<>();
        List<Task> allTasks = taskRepository.findAll();
        
        for (User user : householdUsers) {
            if (user.getAvoidCategories() != null && user.getAvoidCategories().contains(task.getCategory())) {
                workloadMap.put(user.getId(), Integer.MAX_VALUE);
                continue;
            }

            int weeklyPoints = allTasks.stream()
                    .filter(t -> user.getId().equals(t.getAssigneeId()))
                    .mapToInt(Task::getDifficulty)
                    .sum();
            workloadMap.put(user.getId(), weeklyPoints);
        }

        String bestUser = workloadMap.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(householdUsers.get(0).getId());

        if (workloadMap.get(bestUser) == Integer.MAX_VALUE) {
            bestUser = householdUsers.get(0).getId();
        }

        task.setAssigneeId(bestUser);
    }

    public Task stopRecurrence(String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setRecurring(false);
        return taskRepository.save(task);
    }

    public List<Task> getTasksByHousehold(String householdId) {
        return taskRepository.findByHouseholdId(householdId);
    }

    public Task updateTaskStatus(String taskId, TaskStatus status, String completedById) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        if (status == TaskStatus.COMPLETED) {
            task.setCompletedById(completedById);
            task.setCompletedAt(LocalDate.now().toString());
        } else {
            task.setCompletedById(null);
            task.setCompletedAt(null);
        }
        return taskRepository.save(task);
    }

    public List<Map<String, Object>> getLeaderboard(String householdId) {
        Map<String, Integer> pointsMap = new HashMap<>();
        List<Task> householdTasks = taskRepository.findByHouseholdId(householdId);
        
        for (Task task : householdTasks) {
            if (task.getStatus() == TaskStatus.COMPLETED && task.getCompletedById() != null) {
                int points = task.getDifficulty() > 0 ? task.getDifficulty() * 10 : 10;
                pointsMap.put(task.getCompletedById(), pointsMap.getOrDefault(task.getCompletedById(), 0) + points);
            }
        }

        List<Map<String, Object>> leaderboard = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : pointsMap.entrySet()) {
            String userId = entry.getKey();
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                Map<String, Object> userPoints = new HashMap<>();
                userPoints.put("userId", userId);
                userPoints.put("username", user.getUsername());
                userPoints.put("points", entry.getValue());
                leaderboard.add(userPoints);
            }
        }

        leaderboard.sort((m1, m2) -> ((Integer) m2.get("points")).compareTo((Integer) m1.get("points")));
        return leaderboard;
    }

    public Task assignTask(String taskId, String assigneeId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setAssigneeId(assigneeId);
        return taskRepository.save(task);
    }

    public void deleteTask(String taskId) {
        taskRepository.deleteById(taskId);
    }

    public Task vetoTask(String taskId, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getAvoidCategories().contains(task.getCategory())) {
            user.getAvoidCategories().add(task.getCategory());
            userRepository.save(user);
        }

        task.setAssigneeId(null);
        autoAssignTask(task);
        return taskRepository.save(task);
    }

    public void clearAvoidCategories(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.getAvoidCategories().clear();
        userRepository.save(user);
    }

    public List<Task> getReminders(String userId) {
        return taskRepository.findAll().stream()
                .filter(t -> userId.equals(t.getAssigneeId()))
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .filter(t -> "HIGH".equalsIgnoreCase(t.getSeverity()) || TaskStatus.DELAYED == t.getStatus())
                .collect(Collectors.toList());
    }
}
