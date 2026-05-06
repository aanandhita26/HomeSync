package com.chores.backend.service;

import com.chores.backend.model.InventoryItem;
import com.chores.backend.repository.InventoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<InventoryItem> getInventoryByHousehold(String householdId) {
        return inventoryRepository.findByHouseholdId(householdId);
    }

    public InventoryItem addOrUpdateItem(InventoryItem item) {
        if (item.getId() == null || item.getId().isEmpty()) {
            item.setId(UUID.randomUUID().toString());
        }
        return inventoryRepository.save(item);
    }

    public void deleteItem(String itemId) {
        inventoryRepository.deleteById(itemId);
    }
}
