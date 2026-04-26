package com.chores.backend.model;

public class Task {
    private String id;
    private String title;
    private String description;
    private String assigneeId;
    private String householdId;
    private TaskStatus status;
    private String deadline;
    private String severity; // LOW, MEDIUM, HIGH
    private boolean isRecurring;
    private String recurrenceFrequency; // DAILY, WEEKLY, MONTHLY
    private String lastRecurrenceDate; // YYYY-MM-DD

    public Task() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }
    public String getHouseholdId() { return householdId; }
    public void setHouseholdId(String householdId) { this.householdId = householdId; }
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public boolean isRecurring() { return isRecurring; }
    public void setRecurring(boolean isRecurring) { this.isRecurring = isRecurring; }
    public String getRecurrenceFrequency() { return recurrenceFrequency; }
    public void setRecurrenceFrequency(String recurrenceFrequency) { this.recurrenceFrequency = recurrenceFrequency; }
    public String getLastRecurrenceDate() { return lastRecurrenceDate; }
    public void setLastRecurrenceDate(String lastRecurrenceDate) { this.lastRecurrenceDate = lastRecurrenceDate; }
}
