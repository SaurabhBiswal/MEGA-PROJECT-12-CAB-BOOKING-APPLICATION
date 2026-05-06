package com.example.cab_booking_app.repository;

import com.example.cab_booking_app.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByRideId(Long rideId);

    @Query("SELECT AVG(r.driverRating) FROM Rating r WHERE r.driver.id = :driverId AND r.driverRating IS NOT NULL")
    Double findAverageDriverRatingByDriverId(@Param("driverId") Long driverId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.driver.id = :driverId")
    Long countRatingsByDriverId(@Param("driverId") Long driverId);
}
