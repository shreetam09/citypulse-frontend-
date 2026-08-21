package com.citypulse.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {

    @Id
    private String incidentId;

    private String category;
    private String status;
    private String priority;
    private Double severity;
    private Double aiConfidence;

    @Column(length = 1000)
    private String description;

    @Embedded
    private Location location;

    private Instant reportedAt;
    private String latestUpdate;
    private String imageUrl;

    private String department;
    private String division;
    private String team;

    @Embedded
    private AiAnalysis aiAnalysis;

    @ElementCollection
    private List<TimelineEntry> timeline = new ArrayList<>();
}
