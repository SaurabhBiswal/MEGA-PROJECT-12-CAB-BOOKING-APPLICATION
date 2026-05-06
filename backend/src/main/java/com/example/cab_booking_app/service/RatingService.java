package com.example.cab_booking_app.service;

import com.example.cab_booking_app.dto.RatingRequest;
import com.example.cab_booking_app.model.*;
import com.example.cab_booking_app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final RideRepository rideRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    @Transactional
    public Rating submitRating(String riderEmail, RatingRequest request) {
        User rider = userRepository.findByEmail(riderEmail)
                .orElseThrow(() -> new RuntimeException("Rider not found"));

        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() != RideStatus.COMPLETED) {
            throw new RuntimeException("Can only rate completed rides");
        }

        if (ratingRepository.findByRideId(ride.getId()).isPresent()) {
            throw new RuntimeException("Already rated this ride");
        }

        Driver driver = ride.getDriver();

        Rating rating = Rating.builder()
                .ride(ride)
                .rider(rider)
                .driver(driver)
                .driverRating(request.getDriverRating())
                .driverComment(request.getDriverComment())
                .build();

        ratingRepository.save(rating);

        // Update driver's average rating
        Double avgRating = ratingRepository.findAverageDriverRatingByDriverId(driver.getId());
        if (avgRating != null) {
            driver.setAvgRating(Math.round(avgRating * 10.0) / 10.0);
            driverRepository.save(driver);
        }

        return rating;
    }

    public Double getDriverAverageRating(Long driverId) {
        Double avg = ratingRepository.findAverageDriverRatingByDriverId(driverId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }
}
