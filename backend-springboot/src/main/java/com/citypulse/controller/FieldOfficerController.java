package com.citypulse.controller;

import com.citypulse.model.Incident;
import com.citypulse.model.TimelineEntry;
import com.citypulse.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class FieldOfficerController {

    @Autowired
    private IncidentRepository incidentRepository;

    @GetMapping("/api/v1/officer/incidents")
    public ResponseEntity<List<Incident>> getOfficerWorklist() {
        List<Incident> list = incidentRepository.findByStatusIn(Arrays.asList("ASSIGNED", "IN_PROGRESS"));
        return ResponseEntity.ok(list);
    }

    @PostMapping("/api/v1/incidents/{id}/start")
    public ResponseEntity<?> startWork(@PathVariable String id) {
        Optional<Incident> optionalIncident = incidentRepository.findById(id);
        if (optionalIncident.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", Map.of("code", "NOT_FOUND", "message", "Incident not found")));
        }

        Incident incident = optionalIncident.get();
        incident.setStatus("IN_PROGRESS");
        incident.setLatestUpdate("Field officer started repair work on site");
        incident.getTimeline().add(new TimelineEntry("IN_PROGRESS", Instant.now(), "Field repair work initiated"));

        incidentRepository.save(incident);
        return ResponseEntity.ok(Map.of("incidentId", id, "status", "IN_PROGRESS", "startedAt", Instant.now()));
    }

    @PostMapping("/api/v1/incidents/{id}/resolve")
    public ResponseEntity<?> resolveWork(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        Optional<Incident> optionalIncident = incidentRepository.findById(id);
        if (optionalIncident.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", Map.of("code", "NOT_FOUND", "message", "Incident not found")));
        }

        Incident incident = optionalIncident.get();
        String desc = (body != null && body.containsKey("description")) ? body.get("description") : "Work completed on site by repair crew";
        String img = (body != null && body.containsKey("imageUrl")) ? body.get("imageUrl") : "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80";

        incident.setStatus("CITIZEN_VERIFICATION");
        incident.setLatestUpdate("Resolution submitted by field officer · awaiting citizen confirmation");
        incident.getTimeline().add(new TimelineEntry("RESOLVED", Instant.now(), desc));
        incident.getTimeline().add(new TimelineEntry("CITIZEN_VERIFICATION", Instant.now(), "Pending citizen confirmation"));

        incidentRepository.save(incident);
        return ResponseEntity.ok(Map.of(
            "incidentId", id,
            "status", "CITIZEN_VERIFICATION",
            "resolvedAt", Instant.now(),
            "evidenceUrl", img
        ));
    }
}
