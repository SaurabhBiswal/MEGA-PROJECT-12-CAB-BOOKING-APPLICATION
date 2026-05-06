package com.example.cab_booking_app.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "drivers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "vehicle_number", nullable = false)
    private String vehicleNumber;

    @Column(name = "vehicle_model")
    private String vehicleModel;

    @Column(name = "vehicle_color")
    private String vehicleColor;

    @Column(name = "license_number", nullable = false)
    private String licenseNumber;

    @Column(name = "license_image_url")
    private String licenseImageUrl;

    @Column(name = "selfie_image_url")
    private String selfieImageUrl;

    @Builder.Default
    @Column(name = "is_available")
    private boolean available = true;

    @Builder.Default
    @Column(name = "verified")
    private boolean verified = false; // Admin must approve before driver can accept rides

    // Current location (updated in real-time)
    @Column(name = "current_lat")
    private Double currentLat;

    @Column(name = "current_lng")
    private Double currentLng;

    @Builder.Default
    @Column(name = "avg_rating")
    private Double avgRating = 0.0;

    @Builder.Default
    @Column(name = "total_rides")
    private Integer totalRides = 0;

    @Builder.Default
    @Column(name = "total_earnings")
    private Double totalEarnings = 0.0;
}
