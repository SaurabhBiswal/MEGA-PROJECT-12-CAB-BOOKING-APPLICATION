package com.example.cab_booking_app.controller;

import com.example.cab_booking_app.model.*;
import com.example.cab_booking_app.repository.DriverRepository;
import com.example.cab_booking_app.repository.UserRepository;
import com.example.cab_booking_app.service.RideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DRIVER')")
public class DriverController {

    private final RideService rideService;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    @GetMapping("/requests")
    public ResponseEntity<List<Ride>> getAvailableRideRequests() {
        return ResponseEntity.ok(rideService.getAvailableRideRequests());
    }

    @PostMapping("/accept/{rideId}")
    public ResponseEntity<Ride> acceptRide(@AuthenticationPrincipal UserDetails user,
                                            @PathVariable Long rideId) {
        return ResponseEntity.ok(rideService.acceptRide(user.getUsername(), rideId));
    }

    @PutMapping("/ride/{rideId}/status")
    public ResponseEntity<Ride> updateStatus(@AuthenticationPrincipal UserDetails user,
                                              @PathVariable Long rideId,
                                              @RequestParam RideStatus status) {
        return ResponseEntity.ok(rideService.updateRideStatus(user.getUsername(), rideId, status));
    }

    @GetMapping("/my-rides")
    public ResponseEntity<List<Ride>> getMyRides(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(rideService.getDriverHistory(user.getUsername()));
    }

    @PutMapping("/location")
    public ResponseEntity<Map<String, String>> updateLocation(@AuthenticationPrincipal UserDetails user,
                                                               @RequestParam Double lat,
                                                               @RequestParam Double lng) {
        User driverUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        Driver driver = driverRepository.findByUser(driverUser)
                .orElseThrow(() -> new RuntimeException("Driver profile not found"));
        driver.setCurrentLat(lat);
        driver.setCurrentLng(lng);
        driverRepository.save(driver);
        return ResponseEntity.ok(Map.of("message", "Location updated"));
    }

    @PutMapping("/availability")
    public ResponseEntity<Map<String, Object>> toggleAvailability(@AuthenticationPrincipal UserDetails user) {
        User driverUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        Driver driver = driverRepository.findByUser(driverUser)
                .orElseThrow(() -> new RuntimeException("Driver profile not found"));
        driver.setAvailable(!driver.isAvailable());
        driverRepository.save(driver);
        return ResponseEntity.ok(Map.of(
                "message", "Availability updated",
                "available", driver.isAvailable()
        ));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@AuthenticationPrincipal UserDetails user) {
        User driverUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        Driver driver = driverRepository.findByUser(driverUser)
                .orElseThrow(() -> new RuntimeException("Driver profile not found"));

        return ResponseEntity.ok(Map.of(
                "name", driverUser.getName(),
                "isAvailable", driver.isAvailable(),
                "isVerified", driver.isVerified(),
                "totalRides", driver.getTotalRides(),
                "totalEarnings", driver.getTotalEarnings(),
                "avgRating", driver.getAvgRating(),
                "vehicleNumber", driver.getVehicleNumber(),
                "vehicleModel", driver.getVehicleModel() != null ? driver.getVehicleModel() : ""
        ));
    }
}
