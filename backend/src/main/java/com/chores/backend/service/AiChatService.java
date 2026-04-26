package com.chores.backend.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class AiChatService {
    public List<String> breakDownTask(String description) {
        List<String> subTasks = new ArrayList<>();
        if (description == null || description.trim().isEmpty()) return subTasks;
        
        String d = description.toLowerCase();
        
        // Pattern-based logic to simulate "intelligent" breakdown
        if (d.contains("clean") || d.contains("wash")) {
            subTasks.add("Prepare cleaning supplies and equipment");
            if (d.contains("kitchen")) {
                subTasks.add("Clear countertops and sink");
                subTasks.add("Scrub surfaces and appliances");
                subTasks.add("Sweep and mop the kitchen floor");
            } else if (d.contains("bathroom")) {
                subTasks.add("Clean mirror and vanity");
                subTasks.add("Sanitize toilet and shower/tub");
                subTasks.add("Mop floor and empty trash");
            } else {
                subTasks.add("Focus on high-touch areas first");
                subTasks.add("Wipe down major surfaces");
                subTasks.add("Finish with floor treatment");
            }
        } else if (d.contains("fix") || d.contains("repair")) {
            subTasks.add("Inspect damage and identify required tools");
            subTasks.add("Gather necessary parts/materials");
            subTasks.add("Perform the repair meticulously");
            subTasks.add("Test to ensure everything works correctly");
        } else if (d.contains("cook") || d.contains("dinner") || d.contains("meal")) {
            subTasks.add("Review recipe and check pantry for ingredients");
            subTasks.add("Shop for missing items if necessary");
            subTasks.add("Prep ingredients (chopping, measuring)");
            subTasks.add("Cook following the recipe steps");
            subTasks.add("Serve and clear the dining area");
        } else if (d.contains("grocery") || d.contains("shop")) {
            subTasks.add("Inventory current supplies");
            subTasks.add("Create a categorized shopping list");
            subTasks.add("Visit the store/order online");
            subTasks.add("Unpack and organize items");
        } else {
            // Very generic fallback
            subTasks.add("Initial preparation and planning");
            subTasks.add("Execution of the core task: " + description);
            subTasks.add("Final cleanup and verification");
        }
        
        return subTasks;
    }
}
