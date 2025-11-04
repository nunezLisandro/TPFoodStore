package com.example.foodstore.controller;

import com.example.foodstore.model.User;
import com.example.foodstore.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            String name = body.get("name");
            String email = body.get("email");
            String password = body.get("password");
            if (name == null || email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Campos faltantes"));
            }
            User u = userService.register(name, email, password);
            Map<String, Object> res = Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail(), "role", u.getRole());
            return ResponseEntity.created(URI.create("/api/auth/register")).body(res);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Campos faltantes"));
        }
        return userService.login(email, password)
                .map(u -> ResponseEntity.ok(Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail(), "role", u.getRole())))
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Credenciales inválidas")));
    }
}
