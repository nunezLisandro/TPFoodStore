package com.example.foodstore.controller;

import com.example.foodstore.model.Pedido;
import com.example.foodstore.service.PedidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> getAllPedidos() {
        List<Pedido> pedidos = pedidoService.findAll();
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getPedidoById(@PathVariable Long id) {
        Optional<Pedido> pedido = pedidoService.findById(id);
        return pedido.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<Pedido>> getPedidosByUserId(@PathVariable Long userId) {
        List<Pedido> pedidos = pedidoService.findByUserId(userId);
        return ResponseEntity.ok(pedidos);
    }

    @PostMapping
    public ResponseEntity<Pedido> createPedido(@RequestBody PedidoRequest request) {
        try {
            Pedido pedido = pedidoService.createPedido(request);
            return ResponseEntity.created(URI.create("/api/pedidos/" + pedido.getId())).body(pedido);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Pedido> updatePedidoStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        try {
            Pedido pedido = pedidoService.updateStatus(id, request.getStatus());
            return ResponseEntity.ok(pedido);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePedido(@PathVariable Long id) {
        boolean deleted = pedidoService.deleteById(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // DTOs
    public static class PedidoRequest {
        private Long userId;
        private List<PedidoItemRequest> items;
        private String shippingAddress;
        private String phone;
        private String notes;
        private String paymentMethod;
        private Double total;
        private String status;

        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public List<PedidoItemRequest> getItems() { return items; }
        public void setItems(List<PedidoItemRequest> items) { this.items = items; }

        public String getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public Double getTotal() { return total; }
        public void setTotal(Double total) { this.total = total; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class PedidoItemRequest {
        private Long productId;
        private Integer quantity;
        private Double price;

        // Getters and Setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
    }

    public static class StatusUpdateRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}