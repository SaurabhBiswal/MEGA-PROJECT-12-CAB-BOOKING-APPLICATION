package com.example.cab_booking_app.controller;

import com.example.cab_booking_app.model.*;
import com.example.cab_booking_app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final RideRepository rideRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<Driver>> getAllDrivers() {
        return ResponseEntity.ok(driverRepository.findAll());
    }

    @GetMapping("/drivers/pending")
    public ResponseEntity<List<Driver>> getPendingDrivers() {
        return ResponseEntity.ok(driverRepository.findByVerified(false));
    }

    @PutMapping("/drivers/{driverId}/verify")
    public ResponseEntity<Map<String, Object>> verifyDriver(
            @PathVariable Long driverId,
            @RequestParam boolean approve) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        driver.setVerified(approve);
        // If rejected, disable the user account too
        if (!approve) {
            driver.getUser().setEnabled(false);
            userRepository.save(driver.getUser());
        }
        driverRepository.save(driver);
        return ResponseEntity.ok(Map.of(
                "message", approve ? "Driver approved successfully" : "Driver rejected",
                "driverId", driverId,
                "verified", approve
        ));
    }

    @GetMapping("/rides")
    public ResponseEntity<List<Ride>> getAllRides() {
        return ResponseEntity.ok(rideRepository.findAll());
    }

    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<Map<String, Object>> toggleUserStatus(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "message", "User status updated",
                "enabled", user.isEnabled(),
                "userId", userId
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalUsers = userRepository.count();
        long totalDrivers = driverRepository.count();
        long totalRides = rideRepository.count();
        long completedRides = rideRepository.findByStatus(RideStatus.COMPLETED).size();
        long totalPayments = paymentRepository.count();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalDrivers", totalDrivers,
                "totalRides", totalRides,
                "completedRides", completedRides,
                "totalPayments", totalPayments
        ));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        userRepository.deleteById(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
