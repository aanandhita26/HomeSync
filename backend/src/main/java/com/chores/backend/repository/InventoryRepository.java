package com.chores.backend.repository;

import com.chores.backend.model.InventoryItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InventoryRepository extends MongoRepository<InventoryItem, String> {
    List<InventoryItem> findByHouseholdId(String householdId);
}
