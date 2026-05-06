package com.chores.backend.service;

import com.chores.backend.model.InventoryItem;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InventoryService {
    private final JsonDatabaseService db;

    public InventoryService(JsonDatabaseService db) {
        this.db = db;
    }

    public List<InventoryItem> getInventoryByHousehold(String householdId) {
        return db.getDatabase().getInventory().stream()
                .filter(i -> i.getHouseholdId().equals(householdId))
                .collect(Collectors.toList());
    }

    public InventoryItem addOrUpdateItem(InventoryItem item) {
        if (item.getId() == null || item.getId().isEmpty()) {
            item.setId(UUID.randomUUID().toString());
            db.getDatabase().getInventory().add(item);
        } else {
            List<InventoryItem> items = db.getDatabase().getInventory();
            for (int i = 0; i < items.size(); i++) {
                if (items.get(i).getId().equals(item.getId())) {
                    items.set(i, item);
                    break;
                }
            }
        }
        db.save();
        return item;
    }

    public void deleteItem(String itemId) {
        db.getDatabase().getInventory().removeIf(i -> i.getId().equals(itemId));
        db.save();
    }
}
