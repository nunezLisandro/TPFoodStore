package com.example.foodstore.repository;

import com.example.foodstore.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
    
    List<Order> findByEstadoOrderByFechaCreacionDesc(Order.EstadoPedido estado);
    
    
    List<Order> findAllByOrderByFechaCreacionDesc();
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.estado = :estado")
    Long countByEstado(@Param("estado") Order.EstadoPedido estado);
    
    @Query("SELECT COUNT(o) FROM Order o")
    Long countAllOrders();
}