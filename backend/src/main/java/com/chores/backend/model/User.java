package com.chores.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String password;
    private List<String> householdIds = new ArrayList<>();
    private List<String> avoidCategories = new ArrayList<>();

    public User() {}

    public User(String id, String username, String password, List<String> householdIds) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.householdIds = householdIds != null ? householdIds : new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public List<String> getHouseholdIds() { return householdIds; }
    public void setHouseholdIds(List<String> householdIds) { this.householdIds = householdIds; }
    public List<String> getAvoidCategories() { return avoidCategories; }
    public void setAvoidCategories(List<String> avoidCategories) { this.avoidCategories = avoidCategories; }
}
