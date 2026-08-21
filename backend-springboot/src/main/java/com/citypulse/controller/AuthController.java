package com.citypulse.controller;

import com.citypulse.model.User;
import com.citypulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String identifier = body.getOrDefault("email", body.getOrDefault("phone", body.getOrDefault("staffId", body.getOrDefault("badgeId", ""))));
        String password = body.getOrDefault("password", "");
        String role = body.getOrDefault("role", "CITIZEN");

        Optional<User> optionalUser = userRepository.findByEmailOrPhoneOrStaffIdOrBadgeId(identifier, identifier, identifier, identifier);

        User user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
        } else {
            // Create user dynamically if not found
            user = new User(
                "usr_" + (int)(System.currentTimeMillis() % 100000),
                identifier.contains("@") ? identifier.split("@")[0] : identifier,
                identifier.contains("@") ? identifier : identifier + "@citypulse.app",
                identifier,
                password,
                role.toUpperCase(),
                "OP-" + identifier,
                "OFF-" + identifier,
                "mumbai",
                Instant.now()
            );
            userRepository.save(user);
        }

        return ResponseEntity.ok(Map.of(
            "accessToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.CityPulseSpringBootToken2026",
            "refreshToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.CityPulseRefreshToken2026",
            "expiresIn", 3600,
            "user", Map.of(
                "userId", user.getUserId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole()
            )
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "New Citizen");
        String email = body.getOrDefault("email", "citizen@example.com");
        String phone = body.getOrDefault("phone", "9876543210");
        String password = body.getOrDefault("password", "password123");

        User user = new User(
            "usr_" + (int)(System.currentTimeMillis() % 100000),
            name,
            email,
            phone,
            password,
            "CITIZEN",
            null, null,
            "mumbai",
            Instant.now()
        );

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "userId", user.getUserId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", "CITIZEN",
            "createdAt", user.getCreatedAt().toString()
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
