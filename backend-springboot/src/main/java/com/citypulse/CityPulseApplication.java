package com.citypulse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CityPulseApplication {

    public static void main(String[] args) {
        SpringApplication.run(CityPulseApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("🚀 CityPulse Spring Boot Backend API Running on http://localhost:5050");
        System.out.println("==================================================================");
    }
}
