package com.chores.backend.service;

import com.chores.backend.model.DatabaseRoot;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;

@Service
public class JsonDatabaseService {
    private static final String DB_FILE_PATH = "database.json";
    private final ObjectMapper objectMapper;
    private DatabaseRoot cache;

    public JsonDatabaseService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        File file = new File(DB_FILE_PATH);
        if (!file.exists()) {
            cache = new DatabaseRoot();
            save();
        } else {
            try {
                cache = objectMapper.readValue(file, DatabaseRoot.class);
            } catch (IOException e) {
                e.printStackTrace();
                cache = new DatabaseRoot();
            }
        }
    }

    public synchronized void save() {
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(DB_FILE_PATH), cache);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public DatabaseRoot getDatabase() {
        return cache;
    }
}
