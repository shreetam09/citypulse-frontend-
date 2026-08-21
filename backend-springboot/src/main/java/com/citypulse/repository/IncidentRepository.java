package com.citypulse.repository;

import com.citypulse.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, String> {

    List<Incident> findByStatus(String status);

    List<Incident> findByStatusIn(List<String> statuses);

    List<Incident> findByCategory(String category);

    List<Incident> findByPriority(String priority);

    long countByStatusNotIn(List<String> statuses);

    long countByPriority(String priority);
}
