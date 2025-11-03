package com.example.foodstore.controller;

import com.example.foodstore.repository.UserRepository;
import com.example.foodstore.service.UserService;
import com.example.foodstore.model.User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import com.example.foodstore.dto.UserDto;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*")
public class DebugController {

    private final UserRepository userRepository;
    private final UserService userService;

    public DebugController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<UserDto> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole()))
                .collect(Collectors.toList());
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin() {
        try {
            // Crear un admin con credenciales predeterminadas
            User admin = userService.registerAdmin("Admin User", "admin@foodstore.com", "admin123");
            return ResponseEntity.ok(Map.of(
                "id", admin.getId(),
                "name", admin.getName(),
                "email", admin.getEmail(),
                "role", admin.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
