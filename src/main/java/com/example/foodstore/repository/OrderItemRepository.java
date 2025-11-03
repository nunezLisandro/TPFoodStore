package com.example.foodstore.repository;

import com.example.foodstore.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    // Buscar items por pedido
    List<OrderItem> findByOrderId(Long orderId);
    
    // Buscar items por producto
    List<OrderItem> findByProductoId(Long productoId);
}