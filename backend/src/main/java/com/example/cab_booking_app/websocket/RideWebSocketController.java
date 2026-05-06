package com.example.cab_booking_app.websocket;

import com.example.cab_booking_app.dto.RideStatusUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class RideWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Driver sends their location update → broadcasts to rider tracking the ride
     * Frontend sends to: /app/ride/{rideId}/driver-location
     * Frontend subscribes to: /topic/ride/{rideId}
     */
    @MessageMapping("/ride/{rideId}/driver-location")
    @SendTo("/topic/ride/{rideId}")
    public RideStatusUpdate updateDriverLocation(@DestinationVariable Long rideId,
                                                  RideStatusUpdate update) {
        update.setRideId(rideId);
        return update;
    }

    /**
     * SOS alert — broadcast to all admins
     * Frontend sends to: /app/sos
     */
    @MessageMapping("/sos")
    @SendTo("/topic/admin/sos")
    public RideStatusUpdate sendSOS(RideStatusUpdate alert) {
        alert.setMessage("🚨 SOS Alert from Ride #" + alert.getRideId());
        return alert;
    }
}
