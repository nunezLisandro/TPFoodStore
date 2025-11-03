package com.example.foodstore.repository;

import com.example.foodstore.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Buscar pedidos por usuario
    List<Order> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
    
    // Buscar pedidos por estado
    List<Order> findByEstadoOrderByFechaCreacionDesc(Order.EstadoPedido estado);
    
    // Obtener todos los pedidos ordenados por fecha (más recientes primero)
    List<Order> findAllByOrderByFechaCreacionDesc();
    
    // Contar pedidos por estado
    @Query("SELECT COUNT(o) FROM Order o WHERE o.estado = :estado")
    Long countByEstado(@Param("estado") Order.EstadoPedido estado);
    
    // Contar total de pedidos
    @Query("SELECT COUNT(o) FROM Order o")
    Long countAllOrders();
}