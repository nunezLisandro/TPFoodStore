package com.example.foodstore.controller;

import com.example.foodstore.model.Product;
import com.example.foodstore.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Boolean disponible) {
        
        if (nombre != null || categoriaId != null || disponible != null) {
            List<Product> products = productService.findWithFilters(nombre, categoriaId, disponible);
            return ResponseEntity.ok(products);
        }
        
        List<Product> products = productService.findAll();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.findById(id);
        return product.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<Product>> getProductsByCategoria(@PathVariable Long categoriaId) {
        List<Product> products = productService.findByCategoria(categoriaId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<Product>> getAvailableProducts() {
        List<Product> products = productService.findAvailable();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String nombre) {
        List<Product> products = productService.searchByName(nombre);
        return ResponseEntity.ok(products);
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest productRequest) {
        try {
            Product product = convertToProduct(productRequest);
            Product nuevoProduct = productService.save(product);
            return ResponseEntity.created(URI.create("/api/productos/" + nuevoProduct.getId()))
                                .body(nuevoProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest productRequest) {
        try {
            Product product = convertToProduct(productRequest);
            Product productActualizado = productService.update(id, product);
            return ResponseEntity.ok(productActualizado);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody StockUpdateRequest request) {
        boolean updated = productService.updateStock(id, request.getStock());
        if (updated) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Método auxiliar para convertir ProductRequest a Product
    private Product convertToProduct(ProductRequest request) {
        Product product = new Product();
        product.setNombre(request.getNombre());
        product.setDescripcion(request.getDescripcion());
        product.setPrecio(request.getPrecio());
        product.setStock(request.getStock());
        product.setImagen(request.getImagen());
        product.setDisponible(request.getDisponible());
        
        // Configurar categoría
        if (request.getCategoriaId() != null) {
            com.example.foodstore.model.Categoria categoria = new com.example.foodstore.model.Categoria();
            categoria.setId(request.getCategoriaId());
            product.setCategoria(categoria);
        }
        
        return product;
    }

    // Clases auxiliares
    private static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
    }

    public static class ProductRequest {
        private String nombre;
        private String descripcion;
        private java.math.BigDecimal precio;
        private Integer stock;
        private String imagen;
        private Boolean disponible;
        private Long categoriaId;

        // Getters y setters
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }

        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

        public java.math.BigDecimal getPrecio() { return precio; }
        public void setPrecio(java.math.BigDecimal precio) { this.precio = precio; }

        public Integer getStock() { return stock; }
        public void setStock(Integer stock) { this.stock = stock; }

        public String getImagen() { return imagen; }
        public void setImagen(String imagen) { this.imagen = imagen; }

        public Boolean getDisponible() { return disponible; }
        public void setDisponible(Boolean disponible) { this.disponible = disponible; }

        public Long getCategoriaId() { return categoriaId; }
        public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    }

    public static class StockUpdateRequest {
        private Integer stock;

        public Integer getStock() { return stock; }
        public void setStock(Integer stock) { this.stock = stock; }
    }
}