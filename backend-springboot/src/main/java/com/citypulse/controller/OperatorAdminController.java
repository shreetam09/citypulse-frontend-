package com.citypulse.controller;

import com.citypulse.model.Incident;
import com.citypulse.model.TimelineEntry;
import com.citypulse.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/incidents")
public class OperatorAdminController {

    @Autowired
    private IncidentRepository incidentRepository;

    @GetMapping
    public ResponseEntity<List<Incident>> searchIncidents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search) {

        List<Incident> list = incidentRepository.findAll();
        List<Incident> filtered = list.stream().filter(inc -> {
            boolean matchStatus = (status == null || status.equalsIgnoreCase(inc.getStatus()));
            boolean matchCat = (category == null || category.equalsIgnoreCase(inc.getCategory()));
            boolean matchPrio = (priority == null || priority.equalsIgnoreCase(inc.getPriority()));
            boolean matchSearch = (search == null || 
                (inc.getIncidentId() + " " + inc.getDescription() + " " + inc.getCategory()).toLowerCase().contains(search.toLowerCase()));
            return matchStatus && matchCat && matchPrio && matchSearch;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getIncidentDetails(@PathVariable String id) {
        Optional<Incident> incident = incidentRepository.findById(id);
        if (incident.isPresent()) {
            return ResponseEntity.ok(incident.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", Map.of("code", "NOT_FOUND", "message", "Incident not found")));
    }

    @PatchMapping("/{id}/category")
    public ResponseEntity<?> overrideCategory(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<Incident> optionalIncident = incidentRepository.findById(id);
        if (optionalIncident.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", Map.of("code", "NOT_FOUND", "message", "Incident not found")));
        }

        Incident incident = optionalIncident.get();
        String newCategory = body.get("category");
        incident.setCategory(newCategory);
        incident.setLatestUpdate("Operator overridden category to " + newCategory);
        incidentRepository.save(incident);

        return ResponseEntity.ok(incident);
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<?> overridePriority(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<Incident> optionalIncident = incidentRepository.findById(id);
        if (optionalIncident.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", Map.of("code", "NOT_FOUND", "message", "Incident not found")));
        }

        Incident incident = optionalIncident.get();
        String newPriority = body.get("priority");
        incident.setPriority(newPriority);
        incident.setLatestUpdate("Operator overridden priority to " + newPriority);
        incidentRepository.save(incident);

        return ResponseEntity.ok(incident);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<?> assignIncident(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<Incident> optionalIncident = incidentRepository.findById(id);
        if (optionalIncident.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", Map.of("code", "NOT_FOUND", "message", "Incident not found")));
        }

        Incident incident = optionalIncident.get();
        incident.setDepartment(body.get("department"));
        incident.setDivision(body.get("division"));
        incident.setTeam(body.get("team"));
        incident.setStatus("ASSIGNED");
        incident.setLatestUpdate("Assigned to " + incident.getDepartment() + " · " + incident.getDivision());
        incident.getTimeline().add(new TimelineEntry("ASSIGNED", Instant.now(), incident.getLatestUpdate()));

        incidentRepository.save(incident);
        return ResponseEntity.ok(incident);
    }
}
