package com.example.cab_booking_app.controller;

import com.example.cab_booking_app.dto.BookRideRequest;
import com.example.cab_booking_app.model.Ride;
import com.example.cab_booking_app.service.RideService;
import com.example.cab_booking_app.service.ReceiptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;
    private final ReceiptService receiptService;

    @PostMapping("/book")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<Ride> bookRide(@AuthenticationPrincipal UserDetails user,
                                          @Valid @RequestBody BookRideRequest request) {
        return ResponseEntity.ok(rideService.bookRide(user.getUsername(), request));
    }

    @GetMapping("/my-rides")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<List<Ride>> getMyRides(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(rideService.getRiderHistory(user.getUsername()));
    }

    @GetMapping("/{rideId}")
    public ResponseEntity<Ride> getRide(@PathVariable Long rideId) {
        return ResponseEntity.ok(rideService.getRideById(rideId));
    }

    @GetMapping("/{rideId}/fare-estimate")
    public ResponseEntity<Map<String, Object>> getFareEstimate(@PathVariable Long rideId) {
        Ride ride = rideService.getRideById(rideId);
        return ResponseEntity.ok(Map.of(
                "distanceKm", ride.getDistanceKm(),
                "estimatedFare", ride.getEstimatedFare(),
                "baseFare", 30.0,
                "perKmRate", 12.0
        ));
    }

    @GetMapping("/{rideId}/receipt")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long rideId) {
        byte[] pdf = receiptService.generateRideReceipt(rideId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "receipt-ride-" + rideId + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
