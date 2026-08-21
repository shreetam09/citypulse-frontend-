package com.citypulse.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String userId;

    private String name;
    private String email;
    private String phone;
    private String password;
    private String role; // "CITIZEN", "OPERATOR", "FIELD_OFFICER", "ADMIN"
    private String staffId;
    private String badgeId;
    private String city;
    private Instant createdAt;
}
