package com.example.cab_booking_app.service;

import com.example.cab_booking_app.model.*;
import com.example.cab_booking_app.repository.*;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RideRepository rideRepository;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Transactional
    public Map<String, String> createPaymentIntent(Long rideId) throws StripeException {
        Stripe.apiKey = stripeSecretKey;

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() != RideStatus.COMPLETED) {
            throw new RuntimeException("Ride must be completed before payment");
        }

        // Check if payment already exists
        if (paymentRepository.findByRideId(rideId).isPresent()) {
            throw new RuntimeException("Payment already initiated for this ride");
        }

        double amount = ride.getFinalFare() != null ? ride.getFinalFare() : ride.getEstimatedFare();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long) (amount * 100))  // Stripe uses paise/cents
                .setCurrency("inr")
                .setDescription("Cab Booking - Ride #" + rideId)
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        // Save payment record
        Payment payment = Payment.builder()
                .ride(ride)
                .amount(amount)
                .stripePaymentIntentId(intent.getId())
                .stripeClientSecret(intent.getClientSecret())
                .status(PaymentStatus.PENDING)
                .build();

        paymentRepository.save(payment);

        return Map.of(
                "clientSecret", intent.getClientSecret(),
                "paymentIntentId", intent.getId(),
                "amount", String.valueOf(amount)
        );
    }

    @Transactional
    public Payment confirmPayment(String paymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    public Payment getPaymentForRide(Long rideId) {
        return paymentRepository.findByRideId(rideId)
                .orElseThrow(() -> new RuntimeException("Payment not found for ride"));
    }
}
