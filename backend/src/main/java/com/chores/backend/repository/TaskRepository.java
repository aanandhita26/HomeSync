package com.chores.backend.repository;

import com.chores.backend.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByHouseholdId(String householdId);
    List<Task> findByAssigneeId(String assigneeId);
}
