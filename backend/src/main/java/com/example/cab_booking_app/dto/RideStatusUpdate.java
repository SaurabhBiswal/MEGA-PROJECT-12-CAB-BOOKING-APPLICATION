package com.example.cab_booking_app.dto;

import com.example.cab_booking_app.model.RideStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideStatusUpdate {
    private Long rideId;
    private RideStatus status;
    private String message;
    private Double driverLat;
    private Double driverLng;
    private String driverName;
    private String vehicleNumber;
}
