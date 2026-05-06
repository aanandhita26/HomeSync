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

    public int calculateDifficulty(String title) {
        if (title == null || title.isEmpty()) return 1;
        String t = title.toLowerCase();
        
        // High difficulty (Heavy, complex, or long duration)
        if (t.contains("deep clean") || t.contains("oven") || t.contains("repair") || t.contains("assemble") || t.contains("mow")) return 8;
        if (t.contains("cook") || t.contains("dinner") || t.contains("grocery") || t.contains("vacuum")) return 5;
        if (t.contains("trash") || t.contains("dust") || t.contains("water") || t.contains("dishes")) return 2;
        
        return 4; // Default medium-low
    }

    public String categorizeTask(String title) {
        if (title == null || title.isEmpty()) return "General";
        String t = title.toLowerCase();
        
        if (t.contains("cook") || t.contains("dinner") || t.contains("breakfast") || t.contains("lunch") || t.contains("meal")) return "Cooking";
        if (t.contains("clean") || t.contains("wash") || t.contains("mop") || t.contains("vacuum") || t.contains("dust") || t.contains("dishes")) return "Cleaning";
        if (t.contains("fix") || t.contains("repair") || t.contains("assemble") || t.contains("technical")) return "Maintenance";
        if (t.contains("grocery") || t.contains("buy") || t.contains("shop") || t.contains("bill")) return "Errands";
        if (t.contains("trash") || t.contains("garden") || t.contains("water") || t.contains("pet")) return "Outdoor/General";
        
        return "General";
    }
}
