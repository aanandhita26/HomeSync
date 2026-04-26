package com.chores.backend.model;

public class Household {
    private String id;
    private String name;
    private String inviteCode;

    // Constructors
    public Household() {}

    public Household(String id, String name, String inviteCode) {
        this.id = id;
        this.name = name;
        this.inviteCode = inviteCode;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getInviteCode() { return inviteCode; }
    public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }
}
