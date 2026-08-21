package com.citypulse.config;

import com.citypulse.model.AiAnalysis;
import com.citypulse.model.Incident;
import com.citypulse.model.Location;
import com.citypulse.model.TimelineEntry;
import com.citypulse.model.User;
import com.citypulse.repository.IncidentRepository;
import com.citypulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed Pre-configured User Accounts
        if (userRepository.count() == 0) {
            User citizenUser = new User(
                "usr_cit_101",
                "Ananya Das",
                "citizen@citypulse.app",
                "9876543210",
                "password123",
                "CITIZEN",
                null, null,
                "mumbai",
                Instant.now()
            );

            User operatorUser = new User(
                "usr_op_804",
                "Rajesh Sharma",
                "operator@citypulse.app",
                "9876543211",
                "operator123",
                "OPERATOR",
                "OP-BMC-804",
                null,
                "mumbai",
                Instant.now()
            );

            User officerUser = new User(
                "usr_off_104",
                "Suresh Patil",
                "officer@citypulse.app",
                "9876543212",
                "officer123",
                "FIELD_OFFICER",
                null,
                "OFF-BMC-104",
                "mumbai",
                Instant.now()
            );

            userRepository.saveAll(Arrays.asList(citizenUser, operatorUser, officerUser));
            System.out.println("✅ Seed Users (Citizen, Operator, Officer) Initialized in Database!");
        }

        // Seed Sample Incidents
        if (incidentRepository.count() == 0) {
            Incident inc1 = new Incident(
                "CP-2026-001042",
                "POTHOLE",
                "AWAITING_REVIEW",
                "HIGH",
                8.7,
                0.96,
                "Large pothole near the bus stop, creating a severe hazard for two-wheelers.",
                new Location(20.2961, 85.8245, 8.5),
                Instant.now().minus(1, ChronoUnit.HOURS),
                "AI analysis complete — awaiting operator review",
                "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=900&q=80",
                null, null, null,
                new AiAnalysis("POTHOLE", 0.96, 8.7, "CRITICAL", "gemini-2.5-flash (Google AI Studio)", Arrays.asList("large surface damage", "standing water", "traffic hazard")),
                Arrays.asList(
                    new TimelineEntry("SUBMITTED", Instant.now().minus(1, ChronoUnit.HOURS), "Reported by Ananya Das"),
                    new TimelineEntry("AI_ANALYSIS", Instant.now().minus(50, ChronoUnit.MINUTES), "CityPulse Gemini Vision analyzed"),
                    new TimelineEntry("AWAITING_REVIEW", Instant.now().minus(45, ChronoUnit.MINUTES), "Ready for human review")
                )
            );

            Incident inc2 = new Incident(
                "CP-2026-001038",
                "GARBAGE",
                "ASSIGNED",
                "MEDIUM",
                5.2,
                0.91,
                "Overflowing waste collection point on the lane behind Unit 4 market.",
                new Location(20.3012, 85.8183, 12.0),
                Instant.now().minus(5, ChronoUnit.HOURS),
                "Assigned to Sanitation · Central Zone",
                "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=80",
                "Sanitation", "Central Zone", "Market Team A",
                new AiAnalysis("GARBAGE", 0.91, 5.2, "MEDIUM", "gemini-2.5-flash (Google AI Studio)", Arrays.asList("solid waste", "overflowing bin")),
                Arrays.asList(
                    new TimelineEntry("SUBMITTED", Instant.now().minus(5, ChronoUnit.HOURS), "Submitted by citizen"),
                    new TimelineEntry("AWAITING_REVIEW", Instant.now().minus(4, ChronoUnit.HOURS), "Queued for review"),
                    new TimelineEntry("ASSIGNED", Instant.now().minus(3, ChronoUnit.HOURS), "Assigned to Market Team A")
                )
            );

            Incident inc3 = new Incident(
                "CP-2026-001031",
                "BROKEN_STREETLIGHT",
                "IN_PROGRESS",
                "HIGH",
                7.1,
                0.88,
                "Streetlight not working at the turn near the community health centre.",
                new Location(20.2894, 85.8341, 6.0),
                Instant.now().minus(12, ChronoUnit.HOURS),
                "Field officer started work on site",
                "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80",
                "Electrical", "South Zone", "Electrical Team C",
                new AiAnalysis("BROKEN_STREETLIGHT", 0.88, 7.1, "HIGH", "gemini-2.5-flash (Google AI Studio)", Arrays.asList("dark lamp post", "electrical defect")),
                Arrays.asList(
                    new TimelineEntry("SUBMITTED", Instant.now().minus(12, ChronoUnit.HOURS), "Submitted by citizen"),
                    new TimelineEntry("ASSIGNED", Instant.now().minus(10, ChronoUnit.HOURS), "Assigned to Electrical Team C"),
                    new TimelineEntry("IN_PROGRESS", Instant.now().minus(2, ChronoUnit.HOURS), "Work started by Suresh Patil")
                )
            );

            incidentRepository.saveAll(Arrays.asList(inc1, inc2, inc3));
            System.out.println("✅ Sample Seed Incidents Initialized in Spring Boot Database!");
        }
    }
}
