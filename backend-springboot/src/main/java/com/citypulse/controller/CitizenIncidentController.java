package com.citypulse.controller;

import com.citypulse.model.AiAnalysis;
import com.citypulse.model.Incident;
import com.citypulse.model.Location;
import com.citypulse.model.TimelineEntry;
import com.citypulse.repository.IncidentRepository;
import com.citypulse.service.GeminiVisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/incidents")
public class CitizenIncidentController {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private GeminiVisionService geminiVisionService;

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents() {
        return ResponseEntity.ok(incidentRepository.findAll());
    }

    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyIncidents() {
        List<Incident> all = incidentRepository.findAll();
        return ResponseEntity.ok(Map.of(
            "content", all,
            "page", 0,
            "size", 20,
            "totalElements", all.size()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getIncidentById(@PathVariable String id) {
        Optional<Incident> incident = incidentRepository.findById(id);
        if (incident.isPresent()) {
            return ResponseEntity.ok(incident.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", Map.of("code", "NOT_FOUND", "message", "Incident not found")));
    }

    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody Map<String, Object> body) {
        Double lat = body.get("latitude") != null ? Double.parseDouble(body.get("latitude").toString()) : 20.2961;
        Double lng = body.get("longitude") != null ? Double.parseDouble(body.get("longitude").toString()) : 85.8245;
        Double acc = body.get("accuracy") != null ? Double.parseDouble(body.get("accuracy").toString()) : 15.0;

        String description = (String) body.getOrDefault("description", "New civic report submitted by citizen.");
        String categoryHint = (String) body.getOrDefault("category", "OTHER");
        String imageUrl = (String) body.getOrDefault("imageUrl", "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=900&q=80");

        AiAnalysis aiResult = geminiVisionService.analyzeIncident(imageUrl, description, categoryHint);

        String newId = "CP-2026-" + String.format("%06d", (int)(System.currentTimeMillis() % 1000000));

        Incident incident = new Incident();
        incident.setIncidentId(newId);
        incident.setCategory(aiResult.getCategory());
        incident.setStatus("AWAITING_REVIEW");
        incident.setPriority(aiResult.getSeverityLabel());
        incident.setSeverity(aiResult.getSeverity());
        incident.setAiConfidence(aiResult.getConfidence());
        incident.setDescription(description);
        incident.setLocation(new Location(lat, lng, acc));
        incident.setReportedAt(Instant.now());
        incident.setLatestUpdate("Report received · AI analysis complete (Google AI Studio)");
        incident.setImageUrl(imageUrl);
        incident.setAiAnalysis(aiResult);

        List<TimelineEntry> timeline = new ArrayList<>();
        timeline.add(new TimelineEntry("SUBMITTED", Instant.now(), "Report submitted by citizen"));
        timeline.add(new TimelineEntry("AI_ANALYSIS", Instant.now(), "Analyzed by " + aiResult.getModelVersion()));
        timeline.add(new TimelineEntry("AWAITING_REVIEW", Instant.now(), "Queued for municipal operator triage"));
        incident.setTimeline(timeline);

        Incident saved = incidentRepository.save(incident);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<?> verifyIncident(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<Incident> optionalIncident = incidentRepository.findById(id);
        if (optionalIncident.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", Map.of("code", "NOT_FOUND", "message", "Incident not found")));
        }

        Incident incident = optionalIncident.get();
        boolean confirmed = "CONFIRMED".equalsIgnoreCase(body.get("outcome"));
        incident.setStatus(confirmed ? "CLOSED" : "REOPENED");
        incident.setLatestUpdate(confirmed ? "Citizen confirmed resolution · case closed" : "Citizen reopened issue · returned to worklist");
        incident.getTimeline().add(new TimelineEntry(incident.getStatus(), Instant.now(), confirmed ? "Verified by citizen" : "Reopened by citizen"));

        incidentRepository.save(incident);
        return ResponseEntity.ok(Map.of("incidentId", id, "status", incident.getStatus(), "updatedAt", Instant.now()));
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<?> reopenIncident(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<Incident> optionalIncident = incidentRepository.findById(id);
        if (optionalIncident.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", Map.of("code", "NOT_FOUND", "message", "Incident not found")));
        }

        Incident incident = optionalIncident.get();
        String reason = body.getOrDefault("reason", "Citizen requested ticket reopen");
        incident.setStatus("REOPENED");
        incident.setLatestUpdate("Reopened by citizen: " + reason);
        incident.getTimeline().add(new TimelineEntry("REOPENED", Instant.now(), reason));

        incidentRepository.save(incident);
        return ResponseEntity.ok(Map.of("incidentId", id, "status", "REOPENED", "updatedAt", Instant.now()));
    }
}
