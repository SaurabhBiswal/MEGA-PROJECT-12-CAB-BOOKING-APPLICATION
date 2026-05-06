package com.example.cab_booking_app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Valid email required")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String phone;

    // "RIDER" or "DRIVER"
    @NotBlank(message = "Role is required")
    private String role;

    // Driver-only fields
    private String vehicleNumber;
    private String vehicleModel;
    private String vehicleColor;
    private String licenseNumber;
}
