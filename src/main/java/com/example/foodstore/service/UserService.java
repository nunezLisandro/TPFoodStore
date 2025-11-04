package com.example.foodstore.service;

import com.example.foodstore.model.User;
import com.example.foodstore.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(String name, String email, String rawPassword) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        String hashed = passwordEncoder.encode(rawPassword);
        User u = new User(name, email, hashed, "cliente");
        return userRepository.save(u);
    }

    public User registerAdmin(String name, String email, String rawPassword) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        String hashed = passwordEncoder.encode(rawPassword);
        User u = new User(name, email, hashed, "admin");
        return userRepository.save(u);
    }

    public Optional<User> login(String email, String rawPassword) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            if (passwordEncoder.matches(rawPassword, user.get().getPassword())) {
                return user;
            }
        }
        return Optional.empty();
    }
}
