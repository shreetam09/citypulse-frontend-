package com.citypulse.model;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysis {
    private String category;
    private Double confidence;
    private Double severity;
    private String severityLabel;
    private String modelVersion;

    @ElementCollection
    private List<String> detectedFeatures = new ArrayList<>();
}
