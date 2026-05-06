package com.example.cab_booking_app.config;

import com.example.cab_booking_app.model.Role;
import com.example.cab_booking_app.model.User;
import com.example.cab_booking_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create Admin if not exists
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
            System.out.println("✅ Default Admin created: admin@cabbook.com / admin123");
        }
    }
}
