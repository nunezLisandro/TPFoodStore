package com.example.foodstore.repository;

import com.example.foodstore.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Query("SELECT p FROM Pedido p WHERE p.user.id = :userId ORDER BY p.orderDate DESC")
    List<Pedido> findByUserIdOrderByOrderDateDesc(@Param("userId") Long userId);

    @Query("SELECT p FROM Pedido p WHERE p.status = :status ORDER BY p.orderDate DESC")
    List<Pedido> findByStatusOrderByOrderDateDesc(@Param("status") Pedido.Status status);

    @Query("SELECT p FROM Pedido p ORDER BY p.orderDate DESC")
    List<Pedido> findAllOrderByOrderDateDesc();
}