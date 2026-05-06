package com.example.cab_booking_app.repository;

import com.example.cab_booking_app.model.Ride;
import com.example.cab_booking_app.model.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByRiderIdOrderByCreatedAtDesc(Long riderId);
    List<Ride> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    List<Ride> findByStatus(RideStatus status);
    List<Ride> findByStatusOrderByCreatedAtAsc(RideStatus status);
    Optional<Ride> findByIdAndRiderId(Long rideId, Long riderId);
    Optional<Ride> findByIdAndDriverId(Long rideId, Long driverId);
}
