package com.citypulse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "user@citypulse.app");
        String role = body.getOrDefault("role", "OPERATOR");

        return ResponseEntity.ok(Map.of(
            "accessToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.CityPulseSpringBootToken2026",
            "refreshToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.CityPulseRefreshToken2026",
            "expiresIn", 3600,
            "user", Map.of(
                "userId", "usr_" + (int)(System.currentTimeMillis() % 100000),
                "name", email.contains("@") ? email.split("@")[0] : "Suresh Patil",
                "role", role
            )
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "New Citizen");
        String email = body.getOrDefault("email", "citizen@example.com");

        return ResponseEntity.status(201).body(Map.of(
            "userId", "usr_" + (int)(System.currentTimeMillis() % 100000),
            "name", name,
            "email", email,
            "role", "CITIZEN",
            "createdAt", java.time.Instant.now().toString()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of(
            "accessToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.CityPulseRefreshedToken2026",
            "expiresIn", 3600
        ));
    }
}
