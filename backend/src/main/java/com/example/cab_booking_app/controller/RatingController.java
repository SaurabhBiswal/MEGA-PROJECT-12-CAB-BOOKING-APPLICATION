package com.example.cab_booking_app.controller;

import com.example.cab_booking_app.dto.RatingRequest;
import com.example.cab_booking_app.model.Rating;
import com.example.cab_booking_app.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<Rating> submitRating(@AuthenticationPrincipal UserDetails user,
                                                @Valid @RequestBody RatingRequest request) {
        return ResponseEntity.ok(ratingService.submitRating(user.getUsername(), request));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<Map<String, Object>> getDriverRating(@PathVariable Long driverId) {
        Double avg = ratingService.getDriverAverageRating(driverId);
        return ResponseEntity.ok(Map.of(
                "driverId", driverId,
                "averageRating", avg,
                "maxRating", 5
        ));
    }
}
