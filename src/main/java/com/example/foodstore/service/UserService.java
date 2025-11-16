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

    // Métodos para gestión de usuarios por admin
    public java.util.List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public java.util.List<User> findByRole(String role) {
        return userRepository.findByRole(role);
    }

    public boolean deleteById(Long id) {
        // Verificar que el usuario existe
        if (!userRepository.existsById(id)) {
            return false;
        }

        // Verificar que no es el último administrador
        User userToDelete = userRepository.findById(id).orElse(null);
        if (userToDelete != null && "admin".equals(userToDelete.getRole())) {
            long adminCount = userRepository.countByRole("admin");
            if (adminCount <= 1) {
                throw new RuntimeException("No se puede eliminar el último administrador del sistema");
            }
        }

        userRepository.deleteById(id);
        return true;
    }

    public User updateRole(Long id, String newRole) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar que no se está quitando el rol admin al último admin
        if ("admin".equals(user.getRole()) && !"admin".equals(newRole)) {
            long adminCount = userRepository.countByRole("admin");
            if (adminCount <= 1) {
                throw new RuntimeException("No se puede quitar el rol de administrador al último admin del sistema");
            }
        }
        
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public long countByRole(String role) {
        return userRepository.countByRole(role);
    }
}
