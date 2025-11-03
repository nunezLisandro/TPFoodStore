package com.example.foodstore.service;

import com.example.foodstore.model.*;
import com.example.foodstore.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    
    // Costo de envío fijo
    private static final BigDecimal SHIPPING_COST = new BigDecimal("500.00");

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository, 
                       UserRepository userRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public List<Order> findAll() {
        return orderRepository.findAllByOrderByFechaCreacionDesc();
    }

    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> findByUser(Long usuarioId) {
        return orderRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
    }

    public List<Order> findByStatus(Order.EstadoPedido estado) {
        return orderRepository.findByEstadoOrderByFechaCreacionDesc(estado);
    }

    @Transactional
    public Order createOrder(Long usuarioId, List<OrderItemRequest> items, String telefono, 
                           String direccion, String metodoPago, String notas) {
        
        // Validar usuario
        Optional<User> user = userRepository.findById(usuarioId);
        if (user.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        // Validar datos del pedido
        if (telefono == null || telefono.trim().isEmpty()) {
            throw new RuntimeException("El teléfono es requerido");
        }
        if (direccion == null || direccion.trim().isEmpty()) {
            throw new RuntimeException("La dirección es requerida");
        }

        // Convertir método de pago
        Order.MetodoPago metodo;
        try {
            metodo = Order.MetodoPago.valueOf(metodoPago.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Método de pago inválido");
        }

        // Validar y calcular items
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (OrderItemRequest itemRequest : items) {
            Optional<Product> product = productRepository.findById(itemRequest.getProductoId());
            if (product.isEmpty()) {
                throw new RuntimeException("Producto no encontrado: " + itemRequest.getProductoId());
            }
            
            Product prod = product.get();
            
            // Verificar disponibilidad y stock
            if (!prod.getDisponible()) {
                throw new RuntimeException("El producto " + prod.getNombre() + " no está disponible");
            }
            if (prod.getStock() < itemRequest.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para " + prod.getNombre() + 
                                         ". Stock disponible: " + prod.getStock());
            }
            
            // Crear item del pedido
            OrderItem orderItem = new OrderItem();
            orderItem.setProducto(prod);
            orderItem.setCantidad(itemRequest.getCantidad());
            orderItem.setPrecioUnitario(prod.getPrecio());
            
            orderItems.add(orderItem);
            subtotal = subtotal.add(prod.getPrecio().multiply(BigDecimal.valueOf(itemRequest.getCantidad())));
        }

        // Crear el pedido
        BigDecimal total = subtotal.add(SHIPPING_COST);
        Order order = new Order(user.get(), subtotal, SHIPPING_COST, total, telefono, direccion, metodo, notas);
        
        // Guardar el pedido
        Order savedOrder = orderRepository.save(order);
        
        // Asociar items al pedido y guardarlos
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
            
            // Actualizar stock del producto
            Product prod = item.getProducto();
            prod.setStock(prod.getStock() - item.getCantidad());
            productRepository.save(prod);
        }
        
        savedOrder.setItems(orderItems);
        return savedOrder;
    }

    public Order updateStatus(Long orderId, String nuevoEstado) {
        Optional<Order> order = orderRepository.findById(orderId);
        if (order.isEmpty()) {
            throw new RuntimeException("Pedido no encontrado");
        }

        Order.EstadoPedido estado;
        try {
            estado = Order.EstadoPedido.valueOf(nuevoEstado.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado inválido");
        }

        Order ord = order.get();
        ord.setEstado(estado);
        return orderRepository.save(ord);
    }

    // Clase para recibir los datos de los items del pedido
    public static class OrderItemRequest {
        private Long productoId;
        private Integer cantidad;

        public OrderItemRequest() {}

        public OrderItemRequest(Long productoId, Integer cantidad) {
            this.productoId = productoId;
            this.cantidad = cantidad;
        }

        public Long getProductoId() { return productoId; }
        public void setProductoId(Long productoId) { this.productoId = productoId; }

        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }

    // Métodos para estadísticas (útil para el dashboard)
    public Long getTotalOrders() {
        return orderRepository.countAllOrders();
    }

    public Long getOrdersByStatus(Order.EstadoPedido estado) {
        return orderRepository.countByEstado(estado);
    }
}