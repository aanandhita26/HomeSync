package com.chores.backend.controller;

import com.chores.backend.model.InventoryItem;
import com.chores.backend.service.InventoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/household/{hhId}")
    public List<InventoryItem> getInventory(@PathVariable String hhId) {
        return inventoryService.getInventoryByHousehold(hhId);
    }

    @PostMapping
    public InventoryItem addOrUpdate(@RequestBody InventoryItem item) {
        return inventoryService.addOrUpdateItem(item);
    }

    @DeleteMapping("/{itemId}")
    public void delete(@PathVariable String itemId) {
        inventoryService.deleteItem(itemId);
    }
}
