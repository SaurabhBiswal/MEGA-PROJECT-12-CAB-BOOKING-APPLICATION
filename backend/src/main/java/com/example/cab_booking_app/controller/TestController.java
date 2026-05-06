package com.example.cab_booking_app.controller;

import com.example.cab_booking_app.model.Role;
import com.example.cab_booking_app.model.User;
import com.example.cab_booking_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/setup-admin")
    public String setupAdmin() {
        if (!userRepository.existsByEmail("admin@cabbook.com")) {
            User admin = User.builder()
                    .name("Super Admin")
                    .email("admin@cabbook.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("0000000000")
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            return "✅ Admin account created: admin@cabbook.com / admin123. Now go to /login and sign in.";
        }
        return "Admin already exists!";
    }
}
