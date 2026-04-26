package com.chores.backend.controller;

import com.chores.backend.model.Household;
import com.chores.backend.model.User;
import com.chores.backend.service.AuthService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/household")
    public Household createHousehold(@RequestBody Map<String, String> body) {
        return authService.createHousehold(body.get("userId"), body.get("name"));
    }

    @PostMapping("/register")
    public User register(@RequestBody Map<String, String> body) {
        return authService.registerUser(body.get("username"), body.get("password"), body.get("inviteCode"));
    }

    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> body) {
        return authService.login(body.get("username"), body.get("password"));
    }

    @PostMapping("/join")
    public User joinHousehold(@RequestBody Map<String, String> body) {
        return authService.joinHousehold(body.get("userId"), body.get("inviteCode"));
    }

    @GetMapping("/user/households/{userId}")
    public List<Household> getUserHouseholds(@PathVariable("userId") String userId) {
        return authService.getUserHouseholds(userId);
    }

    @GetMapping("/household/{id}/members")
    public List<User> getHouseholdMembers(@PathVariable("id") String id) {
        return authService.getHouseholdMembers(id);
    }

    @PostMapping("/leave")
    public void leaveHousehold(@RequestBody Map<String, String> body) {
        authService.leaveHousehold(body.get("userId"), body.get("householdId"));
    }
}
