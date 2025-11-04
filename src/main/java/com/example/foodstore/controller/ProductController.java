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

    private Product convertToProduct(ProductRequest request) {
        Product product = new Product();
        product.setNombre(request.getNombre());
        product.setDescripcion(request.getDescripcion());
        product.setPrecio(request.getPrecio());
        product.setStock(request.getStock());
        product.setImagen(request.getImagen());
        product.setDisponible(request.getDisponible());
        
        if (request.getCategoriaId() != null) {
            com.example.foodstore.model.Categoria categoria = new com.example.foodstore.model.Categoria();
            categoria.setId(request.getCategoriaId());
            product.setCategoria(categoria);
        }
        
        return product;
    }

    private static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
    }
}