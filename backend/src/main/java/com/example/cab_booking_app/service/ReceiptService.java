package com.example.cab_booking_app.service;

import com.example.cab_booking_app.model.*;
import com.example.cab_booking_app.repository.*;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.LineSeparator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final RideRepository rideRepository;
    private final PaymentRepository paymentRepository;

    public byte[] generateRideReceipt(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        Payment payment = paymentRepository.findByRideId(rideId)
                .orElse(null);

        try {
            Document document = new Document(PageSize.A4);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            document.open();

            // Header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, BaseColor.DARK_GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.DARK_GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.DARK_GRAY);
            Font greenFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new BaseColor(34, 197, 94));

            Paragraph title = new Paragraph("🚖 Cab Booking - Ride Receipt", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Separator
            document.add(new Chunk(new LineSeparator()));
            document.add(Chunk.NEWLINE);

            // Ride Info
            document.add(new Paragraph("Ride Details", headerFont));
            document.add(new Paragraph("Ride ID: #" + ride.getId(), normalFont));
            document.add(new Paragraph("Date: " + ride.getCreatedAt().format(
                    DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")), normalFont));
            document.add(new Paragraph("Status: " + ride.getStatus(), normalFont));
            document.add(Chunk.NEWLINE);

            // Route
            document.add(new Paragraph("Route", headerFont));
            document.add(new Paragraph("📍 Pickup: " + ride.getPickupLocation(), normalFont));
            document.add(new Paragraph("🏁 Drop: " + ride.getDropLocation(), normalFont));
            document.add(new Paragraph("📏 Distance: " + ride.getDistanceKm() + " km", normalFont));
            document.add(Chunk.NEWLINE);

            // Passenger Info
            document.add(new Paragraph("Passenger", headerFont));
            document.add(new Paragraph("Name: " + ride.getRider().getName(), normalFont));
            document.add(new Paragraph("Email: " + ride.getRider().getEmail(), normalFont));
            document.add(Chunk.NEWLINE);

            // Driver Info
            if (ride.getDriver() != null) {
                document.add(new Paragraph("Driver", headerFont));
                document.add(new Paragraph("Name: " + ride.getDriver().getUser().getName(), normalFont));
                document.add(new Paragraph("Vehicle: " + ride.getDriver().getVehicleModel()
                        + " (" + ride.getDriver().getVehicleNumber() + ")", normalFont));
                document.add(Chunk.NEWLINE);
            }

            // Payment
            document.add(new Chunk(new LineSeparator()));
            document.add(Chunk.NEWLINE);
            document.add(new Paragraph("Payment Summary", headerFont));
            document.add(new Paragraph("Base Fare: ₹30.00", normalFont));
            document.add(new Paragraph("Distance Charge: ₹" + String.format("%.2f",
                    ride.getDistanceKm() != null ? ride.getDistanceKm() * 12 : 0), normalFont));

            double total = ride.getFinalFare() != null ? ride.getFinalFare() : ride.getEstimatedFare();
            Paragraph totalPara = new Paragraph("Total Amount: ₹" + String.format("%.2f", total), greenFont);
            totalPara.setSpacingBefore(10);
            document.add(totalPara);

            if (payment != null) {
                document.add(new Paragraph("Payment Status: " + payment.getStatus(), normalFont));
                document.add(new Paragraph("Payment ID: " + payment.getStripePaymentIntentId(), normalFont));
            }

            document.add(Chunk.NEWLINE);
            document.add(new Chunk(new LineSeparator()));
            Paragraph footer = new Paragraph("Thank you for riding with CabBook! 🚖", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(15);
            document.add(footer);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate receipt: " + e.getMessage());
        }
    }
}
