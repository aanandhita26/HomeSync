package com.chores.backend.service;

import com.chores.backend.model.Household;
import com.chores.backend.model.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.chores.backend.repository.HouseholdRepository;
import com.chores.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final HouseholdRepository householdRepository;

    public AuthService(UserRepository userRepository, HouseholdRepository householdRepository) {
        this.userRepository = userRepository;
        this.householdRepository = householdRepository;
    }

    public Household createHousehold(String userId, String name) {
        Household h = new Household(UUID.randomUUID().toString(), name, UUID.randomUUID().toString().substring(0, 8));
        householdRepository.save(h);
        
        if (userId != null) {
            userRepository.findById(userId).ifPresent(u -> {
                u.getHouseholdIds().add(h.getId());
                userRepository.save(u);
            });
        }
        
        return h;
    }

    public User registerUser(String username, String password, String inviteCode) {
        List<String> householdIds = new ArrayList<>();
        
        if (inviteCode != null && !inviteCode.isEmpty()) {
            Household h = householdRepository.findByInviteCode(inviteCode)
                    .orElseThrow(() -> new RuntimeException("Invalid invite code"));
            householdIds.add(h.getId());
        }
        
        User u = new User(UUID.randomUUID().toString(), username, password, householdIds);
        return userRepository.save(u);
    }

    public User joinHousehold(String userId, String inviteCode) {
        Household h = householdRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!u.getHouseholdIds().contains(h.getId())) {
            u.getHouseholdIds().add(h.getId());
            userRepository.save(u);
        }
        return u;
    }

    public List<Household> getUserHouseholds(String userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return (List<Household>) householdRepository.findAllById(u.getHouseholdIds());
    }

    public List<User> getHouseholdMembers(String householdId) {
        // This is inefficient but works for now. Better to query by householdId in mongo.
        return userRepository.findAll().stream()
                .filter(u -> u.getHouseholdIds().contains(householdId))
                .collect(Collectors.toList());
    }

    public User login(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(u -> u.getPassword().equals(password))
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
    }

    public void leaveHousehold(String userId, String householdId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        u.getHouseholdIds().remove(householdId);
        userRepository.save(u);
    }
}
