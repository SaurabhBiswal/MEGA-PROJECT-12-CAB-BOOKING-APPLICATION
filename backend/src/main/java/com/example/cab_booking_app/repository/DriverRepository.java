package com.example.cab_booking_app.repository;

import com.example.cab_booking_app.model.Driver;
import com.example.cab_booking_app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByUser(User user);
    Optional<Driver> findByUserId(Long userId);
    List<Driver> findByAvailableTrue();

    @Query("SELECT d FROM Driver d WHERE d.available = true AND d.user.enabled = true AND d.verified = true")
    List<Driver> findAllAvailableDrivers();

    List<Driver> findByVerified(boolean verified);
}
