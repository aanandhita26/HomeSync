package com.chores.backend.model;

import java.util.ArrayList;
import java.util.List;

public class DatabaseRoot {
    private List<Household> households = new ArrayList<>();
    private List<User> users = new ArrayList<>();
    private List<Task> tasks = new ArrayList<>();
    private List<InventoryItem> inventory = new ArrayList<>();

    public DatabaseRoot() {}

    public List<Household> getHouseholds() { return households; }
    public void setHouseholds(List<Household> households) { this.households = households; }
    public List<User> getUsers() { return users; }
    public void setUsers(List<User> users) { this.users = users; }
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
    public List<InventoryItem> getInventory() { return inventory; }
    public void setInventory(List<InventoryItem> inventory) { this.inventory = inventory; }
}
