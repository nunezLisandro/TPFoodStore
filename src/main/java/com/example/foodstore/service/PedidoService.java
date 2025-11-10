package com.example.foodstore.service;

import com.example.foodstore.controller.PedidoController.PedidoRequest;
import com.example.foodstore.controller.PedidoController.PedidoItemRequest;
import com.example.foodstore.model.*;
import com.example.foodstore.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public PedidoService(PedidoRepository pedidoRepository, 
                        UserRepository userRepository,
                        ProductRepository productRepository) {
        this.pedidoRepository = pedidoRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public List<Pedido> findAll() {
        return pedidoRepository.findAllOrderByOrderDateDesc();
    }

    public Optional<Pedido> findById(Long id) {
        return pedidoRepository.findById(id);
    }

    public List<Pedido> findByUserId(Long userId) {
        return pedidoRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    public List<Pedido> findByStatus(Pedido.Status status) {
        return pedidoRepository.findByStatusOrderByOrderDateDesc(status);
    }

    public Pedido createPedido(PedidoRequest request) {
        // Validate user
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Create pedido
        Pedido pedido = new Pedido();
        pedido.setUser(user);
        pedido.setShippingAddress(request.getShippingAddress());
        pedido.setPhone(request.getPhone());
        pedido.setNotes(request.getNotes());
        pedido.setPaymentMethod(request.getPaymentMethod());
        pedido.setTotalAmount(BigDecimal.valueOf(request.getTotal()));
        
        // Set status
        if (request.getStatus() != null) {
            pedido.setStatus(Pedido.Status.fromString(request.getStatus()));
        }

        // Create order items
        for (PedidoItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + itemRequest.getProductId()));

            PedidoItem item = new PedidoItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setPrice(BigDecimal.valueOf(itemRequest.getPrice()));
            
            pedido.addOrderItem(item);
        }

        return pedidoRepository.save(pedido);
    }

    public Pedido updateStatus(Long pedidoId, String statusStr) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        
        Pedido.Status status = Pedido.Status.fromString(statusStr);
        pedido.setStatus(status);
        
        return pedidoRepository.save(pedido);
    }

    public boolean deleteById(Long id) {
        if (pedidoRepository.existsById(id)) {
            pedidoRepository.deleteById(id);
            return true;
        }
        return false;
    }
}