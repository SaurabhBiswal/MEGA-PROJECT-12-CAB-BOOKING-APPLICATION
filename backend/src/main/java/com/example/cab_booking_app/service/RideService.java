package com.example.cab_booking_app.service;

import com.example.cab_booking_app.dto.BookRideRequest;
import com.example.cab_booking_app.dto.RideStatusUpdate;
import com.example.cab_booking_app.model.*;
import com.example.cab_booking_app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final double BASE_FARE = 30.0;
    private static final double PER_KM_RATE = 12.0;

    /**
     * Haversine formula — calculates distance between two GPS coords (no API needed!)
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public double calculateFare(double distanceKm) {
        return BASE_FARE + (distanceKm * PER_KM_RATE);
    }

    @Transactional
    public Ride bookRide(String riderEmail, BookRideRequest request) {
        User rider = userRepository.findByEmail(riderEmail)
                .orElseThrow(() -> new RuntimeException("Rider not found"));

        double distance = calculateDistance(
                request.getPickupLat(), request.getPickupLng(),
                request.getDropLat(), request.getDropLng()
        );
        double fare = calculateFare(distance);

        Ride ride = Ride.builder()
                .rider(rider)
                .pickupLocation(request.getPickupLocation())
                .pickupLat(request.getPickupLat())
                .pickupLng(request.getPickupLng())
                .dropLocation(request.getDropLocation())
                .dropLat(request.getDropLat())
                .dropLng(request.getDropLng())
                .distanceKm(Math.round(distance * 100.0) / 100.0)
                .estimatedFare(Math.round(fare * 100.0) / 100.0)
                .status(RideStatus.REQUESTED)
                .build();

        Ride saved = rideRepository.save(ride);

        // Notify all available drivers via WebSocket
        messagingTemplate.convertAndSend("/topic/driver/new-ride",
                RideStatusUpdate.builder()
                        .rideId(saved.getId())
                        .status(RideStatus.REQUESTED)
                        .message("New ride request from " + rider.getName())
                        .build()
        );

        return saved;
    }

    @Transactional
    public Ride acceptRide(String driverEmail, Long rideId) {
        User driverUser = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Driver driver = driverRepository.findByUser(driverUser)
                .orElseThrow(() -> new RuntimeException("Driver profile not found"));

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new RuntimeException("Ride is no longer available");
        }

        ride.setDriver(driver);
        ride.setStatus(RideStatus.ACCEPTED);
        driver.setAvailable(false);

        rideRepository.save(ride);
        driverRepository.save(driver);

        // Notify the rider their ride was accepted
        messagingTemplate.convertAndSend("/topic/ride/" + rideId,
                RideStatusUpdate.builder()
                        .rideId(rideId)
                        .status(RideStatus.ACCEPTED)
                        .message("Your ride has been accepted!")
                        .driverName(driverUser.getName())
                        .vehicleNumber(driver.getVehicleNumber())
                        .build()
        );

        return ride;
    }

    @Transactional
    public Ride updateRideStatus(String driverEmail, Long rideId, RideStatus newStatus) {
        User driverUser = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Driver driver = driverRepository.findByUser(driverUser)
                .orElseThrow(() -> new RuntimeException("Driver profile not found"));

        Ride ride = rideRepository.findByIdAndDriverId(rideId, driver.getId())
                .orElseThrow(() -> new RuntimeException("Ride not found or not assigned to this driver"));

        ride.setStatus(newStatus);

        if (newStatus == RideStatus.ONGOING) {
            ride.setStartedAt(LocalDateTime.now());
        } else if (newStatus == RideStatus.COMPLETED) {
            ride.setCompletedAt(LocalDateTime.now());
            ride.setFinalFare(ride.getEstimatedFare());
            driver.setAvailable(true);
            driver.setTotalRides(driver.getTotalRides() + 1);
            driver.setTotalEarnings(driver.getTotalEarnings() + ride.getFinalFare());
            driverRepository.save(driver);
        }

        Ride saved = rideRepository.save(ride);

        // Broadcast status change to rider
        messagingTemplate.convertAndSend("/topic/ride/" + rideId,
                RideStatusUpdate.builder()
                        .rideId(rideId)
                        .status(newStatus)
                        .message(getStatusMessage(newStatus))
                        .driverName(driverUser.getName())
                        .vehicleNumber(driver.getVehicleNumber())
                        .build()
        );

        return saved;
    }

    private String getStatusMessage(RideStatus status) {
        return switch (status) {
            case DRIVER_ARRIVED -> "Your driver has arrived!";
            case ONGOING -> "Your ride has started!";
            case COMPLETED -> "Ride completed. Please rate your driver.";
            case CANCELLED -> "Ride has been cancelled.";
            default -> "Ride status updated";
        };
    }

    public List<Ride> getRiderHistory(String email) {
        User rider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Rider not found"));
        return rideRepository.findByRiderIdOrderByCreatedAtDesc(rider.getId());
    }

    public List<Ride> getDriverHistory(String email) {
        User driverUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        Driver driver = driverRepository.findByUser(driverUser)
                .orElseThrow(() -> new RuntimeException("Driver profile not found"));
        return rideRepository.findByDriverIdOrderByCreatedAtDesc(driver.getId());
    }

    public List<Ride> getAvailableRideRequests() {
        return rideRepository.findByStatusOrderByCreatedAtAsc(RideStatus.REQUESTED);
    }

    public Ride getRideById(Long rideId) {
        return rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
    }
}
