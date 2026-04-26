package com.chores.backend.model;

import java.util.ArrayList;
import java.util.List;

public class User {
    private String id;
    private String username;
    private String password;
    private List<String> householdIds = new ArrayList<>();

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
}
