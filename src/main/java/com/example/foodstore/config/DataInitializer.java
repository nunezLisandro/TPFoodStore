package com.example.foodstore.config;

import com.example.foodstore.model.*;
import com.example.foodstore.repository.UserRepository;
import com.example.foodstore.repository.CategoriaRepository;
import com.example.foodstore.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductRepository productRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataInitializer(UserRepository userRepository, CategoriaRepository categoriaRepository, 
                          ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.categoriaRepository = categoriaRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Solo inicializar si no hay datos
        if (userRepository.count() == 0) {
            initializeUsers();
        }
        if (categoriaRepository.count() == 0) {
            initializeCategories();
        }
        if (productRepository.count() == 0) {
            initializeProducts();
        }
    }

    private void initializeUsers() {
        // Crear usuario admin
        User admin = new User("Admin", "admin@food.com", 
                             passwordEncoder.encode("admin123"), "admin");
        userRepository.save(admin);

        // Crear usuario cliente
        User cliente = new User("Juan Pérez", "cliente@food.com", 
                               passwordEncoder.encode("cliente123"), "cliente");
        userRepository.save(cliente);

        System.out.println("✅ Usuarios de prueba creados:");
        System.out.println("   Admin: admin@food.com / admin123");
        System.out.println("   Cliente: cliente@food.com / cliente123");
    }

    private void initializeCategories() {
        Categoria pizzas = new Categoria("Pizzas", "Deliciosas pizzas artesanales", 
                                       "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b");
        categoriaRepository.save(pizzas);

        Categoria hamburguesas = new Categoria("Hamburguesas", "Hamburguesas gourmet", 
                                             "https://images.unsplash.com/photo-1568901346375-23c9450c58cd");
        categoriaRepository.save(hamburguesas);

        Categoria bebidas = new Categoria("Bebidas", "Bebidas frías y refrescantes", 
                                        "https://images.unsplash.com/photo-1544145945-f90425340c7e");
        categoriaRepository.save(bebidas);

        Categoria postres = new Categoria("Postres", "Deliciosos postres caseros", 
                                        "https://images.unsplash.com/photo-1551024506-0bccd828d307");
        categoriaRepository.save(postres);

        System.out.println("✅ Categorías de prueba creadas");
    }

    private void initializeProducts() {
        // Obtener categorías
        Categoria pizzas = categoriaRepository.findById(1L).orElse(null);
        Categoria hamburguesas = categoriaRepository.findById(2L).orElse(null);
        Categoria bebidas = categoriaRepository.findById(3L).orElse(null);
        Categoria postres = categoriaRepository.findById(4L).orElse(null);

        if (pizzas != null) {
            // Pizzas
            productRepository.save(new Product("Pizza Margherita", "Pizza clásica con tomate, mozzarella y albahaca", 
                                            new BigDecimal("2500.00"), 10, 
                                            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002", true, pizzas));
            
            productRepository.save(new Product("Pizza Pepperoni", "Pizza con salsa de tomate, mozzarella y pepperoni", 
                                            new BigDecimal("2800.00"), 8, 
                                            "https://images.unsplash.com/photo-1628840042765-356cda07504e", true, pizzas));
        }

        if (hamburguesas != null) {
            // Hamburguesas
            productRepository.save(new Product("Hamburguesa Clásica", "Hamburguesa de carne con lechuga, tomate y cebolla", 
                                            new BigDecimal("2200.00"), 15, 
                                            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd", true, hamburguesas));
            
            productRepository.save(new Product("Hamburguesa BBQ", "Hamburguesa con salsa BBQ, bacon y queso cheddar", 
                                            new BigDecimal("2600.00"), 12, 
                                            "https://images.unsplash.com/photo-1571091718767-18b5b1457add", true, hamburguesas));
        }

        if (bebidas != null) {
            // Bebidas
            productRepository.save(new Product("Coca Cola", "Bebida cola 500ml", 
                                            new BigDecimal("800.00"), 25, 
                                            "https://images.unsplash.com/photo-1629203851122-3726ecdf080e", true, bebidas));
            
            productRepository.save(new Product("Agua Mineral", "Agua mineral 500ml", 
                                            new BigDecimal("600.00"), 30, 
                                            "https://images.unsplash.com/photo-1548839140-29a749e1cf4d", true, bebidas));
        }

        if (postres != null) {
            // Postres
            productRepository.save(new Product("Tiramisu", "Postre italiano con café y mascarpone", 
                                            new BigDecimal("1800.00"), 6, 
                                            "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9", true, postres));
        }

        System.out.println("✅ Productos de prueba creados");
    }
}
