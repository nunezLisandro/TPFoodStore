package com.example.foodstore.controller;

import com.example.foodstore.model.Order;
import com.example.foodstore.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders(@RequestParam(required = false) String estado) {
        if (estado != null) {
            try {
                Order.EstadoPedido estadoPedido = Order.EstadoPedido.valueOf(estado.toUpperCase());
                List<Order> orders = orderService.findByStatus(estadoPedido);
                return ResponseEntity.ok(orders);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        
        List<Order> orders = orderService.findAll();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Optional<Order> order = orderService.findById(id);
        return order.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable Long usuarioId) {
        List<Order> orders = orderService.findByUser(usuarioId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            Order order = orderService.createOrder(
                orderRequest.getUsuarioId(),
                orderRequest.getItems(),
                orderRequest.getTelefono(),
                orderRequest.getDireccion(),
                orderRequest.getMetodoPago(),
                orderRequest.getNotas()
            );
            return ResponseEntity.created(URI.create("/api/pedidos/" + order.getId()))
                                .body(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String nuevoEstado = request.get("estado");
            if (nuevoEstado == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Estado es requerido"));
            }
            
            Order order = orderService.updateStatus(id, nuevoEstado);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Endpoint para estadísticas (útil para dashboard admin)
    @GetMapping("/stats")
    public ResponseEntity<OrderStats> getOrderStats() {
        OrderStats stats = new OrderStats();
        stats.setTotal(orderService.getTotalOrders());
        stats.setPending(orderService.getOrdersByStatus(Order.EstadoPedido.PENDING));
        stats.setProcessing(orderService.getOrdersByStatus(Order.EstadoPedido.PROCESSING));
        stats.setCompleted(orderService.getOrdersByStatus(Order.EstadoPedido.COMPLETED));
        stats.setCancelled(orderService.getOrdersByStatus(Order.EstadoPedido.CANCELLED));
        
        return ResponseEntity.ok(stats);
    }

    // Clases auxiliares
    public static class OrderRequest {
        private Long usuarioId;
        private List<OrderService.OrderItemRequest> items;
        private String telefono;
        private String direccion;
        private String metodoPago;
        private String notas;

        // Getters y setters
        public Long getUsuarioId() { return usuarioId; }
        public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

        public List<OrderService.OrderItemRequest> getItems() { return items; }
        public void setItems(List<OrderService.OrderItemRequest> items) { this.items = items; }

        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }

        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }

        public String getMetodoPago() { return metodoPago; }
        public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

        public String getNotas() { return notas; }
        public void setNotas(String notas) { this.notas = notas; }
    }

    public static class OrderStats {
        private Long total;
        private Long pending;
        private Long processing;
        private Long completed;
        private Long cancelled;

        // Getters y setters
        public Long getTotal() { return total; }
        public void setTotal(Long total) { this.total = total; }

        public Long getPending() { return pending; }
        public void setPending(Long pending) { this.pending = pending; }

        public Long getProcessing() { return processing; }
        public void setProcessing(Long processing) { this.processing = processing; }

        public Long getCompleted() { return completed; }
        public void setCompleted(Long completed) { this.completed = completed; }

        public Long getCancelled() { return cancelled; }
        public void setCancelled(Long cancelled) { this.cancelled = cancelled; }
    }

    private static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
    }
}