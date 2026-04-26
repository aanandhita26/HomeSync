package com.chores.backend.service;

import com.chores.backend.model.Household;
import com.chores.backend.model.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private final JsonDatabaseService db;

    public AuthService(JsonDatabaseService db) {
        this.db = db;
    }

    public Household createHousehold(String userId, String name) {
        System.out.println("Creating household: " + name + " for user: " + userId);
        Household h = new Household(UUID.randomUUID().toString(), name, UUID.randomUUID().toString().substring(0, 8));
        db.getDatabase().getHouseholds().add(h);
        
        // Link to user if userId provided
        if (userId != null) {
            System.out.println("Linking to user: " + userId);
            db.getDatabase().getUsers().stream()
                .filter(u -> u.getId().equals(userId))
                .findFirst()
                .ifPresentOrElse(
                    u -> {
                        u.getHouseholdIds().add(h.getId());
                        System.out.println("Successfully linked to user");
                    },
                    () -> System.out.println("User NOT found in database")
                );
        }
        
        db.save();
        return h;
    }

    public User registerUser(String username, String password, String inviteCode) {
        List<String> householdIds = new ArrayList<>();
        
        if (inviteCode != null && !inviteCode.isEmpty()) {
            Optional<Household> h = db.getDatabase().getHouseholds().stream()
                    .filter(house -> house.getInviteCode().equals(inviteCode))
                    .findFirst();
            if (h.isEmpty()) throw new RuntimeException("Invalid invite code");
            householdIds.add(h.get().getId());
        }
        
        User u = new User(UUID.randomUUID().toString(), username, password, householdIds);
        db.getDatabase().getUsers().add(u);
        db.save();
        return u;
    }

    public User joinHousehold(String userId, String inviteCode) {
        Household h = db.getDatabase().getHouseholds().stream()
                .filter(house -> house.getInviteCode().equals(inviteCode))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        User u = db.getDatabase().getUsers().stream()
                .filter(user -> user.getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!u.getHouseholdIds().contains(h.getId())) {
            u.getHouseholdIds().add(h.getId());
            db.save();
        }
        return u;
    }

    public List<Household> getUserHouseholds(String userId) {
        Optional<User> uOpt = db.getDatabase().getUsers().stream()
                .filter(user -> user.getId().equals(userId))
                .findFirst();
        
        if (uOpt.isEmpty()) return new ArrayList<>();
        User u = uOpt.get();

        return db.getDatabase().getHouseholds().stream()
                .filter(h -> u.getHouseholdIds().contains(h.getId()))
                .collect(Collectors.toList());
    }

    public List<User> getHouseholdMembers(String householdId) {
        return db.getDatabase().getUsers().stream()
                .filter(u -> u.getHouseholdIds().contains(householdId))
                .collect(Collectors.toList());
    }

    public User login(String username, String password) {
        return db.getDatabase().getUsers().stream()
                .filter(u -> u.getUsername().equals(username) && u.getPassword().equals(password))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
    }

    public void leaveHousehold(String userId, String householdId) {
        User u = db.getDatabase().getUsers().stream()
                .filter(user -> user.getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        u.getHouseholdIds().remove(householdId);
        db.save();
    }
}
