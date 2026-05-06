package com.example.cab_booking_app.controller;

import com.example.cab_booking_app.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent/{rideId}")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@PathVariable Long rideId) {
        try {
            return ResponseEntity.ok(paymentService.createPaymentIntent(rideId));
        } catch (StripeException e) {
            throw new RuntimeException("Stripe error: " + e.getMessage());
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, String>> confirmPayment(@RequestParam String paymentIntentId) {
        paymentService.confirmPayment(paymentIntentId);
        return ResponseEntity.ok(Map.of("message", "Payment confirmed successfully!"));
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<?> getPaymentForRide(@PathVariable Long rideId) {
        return ResponseEntity.ok(paymentService.getPaymentForRide(rideId));
    }
}
