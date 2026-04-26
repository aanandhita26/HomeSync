package com.chores.backend.controller;

import com.chores.backend.service.AiChatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {
    private final AiChatService aiService;

    public AiController(AiChatService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/breakdown")
    public List<String> breakdownTask(@RequestBody Map<String, String> body) {
        return aiService.breakDownTask(body.get("description"));
    }
}
