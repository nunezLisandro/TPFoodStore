package com.example.foodstore.service;

import com.example.foodstore.model.Product;
import com.example.foodstore.model.Categoria;
import com.example.foodstore.repository.ProductRepository;
import com.example.foodstore.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductService(ProductRepository productRepository, CategoriaRepository categoriaRepository) {
        this.productRepository = productRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> findByCategoria(Long categoriaId) {
        return productRepository.findByCategoriaId(categoriaId);
    }

    public List<Product> findAvailable() {
        return productRepository.findByDisponibleTrue();
    }

    public List<Product> searchByName(String nombre) {
        return productRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public List<Product> findWithFilters(String nombre, Long categoriaId, Boolean disponible) {
        return productRepository.findProductsWithFilters(nombre, categoriaId, disponible);
    }

    public Product save(Product product) {
        validateProduct(product);

        if (product.getCategoria() == null || product.getCategoria().getId() == null) {
            throw new RuntimeException("La categoría es requerida");
        }

        Optional<Categoria> categoria = categoriaRepository.findById(product.getCategoria().getId());
        if (categoria.isEmpty()) {
            throw new RuntimeException("La categoría especificada no existe");
        }

        product.setCategoria(categoria.get());
        return productRepository.save(product);
    }

    public Product update(Long id, Product productActualizado) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isEmpty()) {
            throw new RuntimeException("Producto no encontrado");
        }

        Product product = existingProduct.get();
        
        product.setNombre(productActualizado.getNombre());
        product.setDescripcion(productActualizado.getDescripcion());
        product.setPrecio(productActualizado.getPrecio());
        product.setStock(productActualizado.getStock());
        product.setImagen(productActualizado.getImagen());
        product.setDisponible(productActualizado.getDisponible());

        if (productActualizado.getCategoria() != null && productActualizado.getCategoria().getId() != null) {
            Optional<Categoria> categoria = categoriaRepository.findById(productActualizado.getCategoria().getId());
            if (categoria.isEmpty()) {
                throw new RuntimeException("La categoría especificada no existe");
            }
            product.setCategoria(categoria.get());
        }

        return save(product);
    }

    public void deleteById(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado");
        }
        productRepository.deleteById(id);
    }

    public boolean updateStock(Long productId, Integer newStock) {
        Optional<Product> product = productRepository.findById(productId);
        if (product.isPresent()) {
            product.get().setStock(newStock);
            productRepository.save(product.get());
            return true;
        }
        return false;
    }

    public Product addStock(Long productId, Integer stockToAdd) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Producto no encontrado con ID: " + productId);
        }
        
        Product product = productOpt.get();
        if (stockToAdd == null || stockToAdd <= 0) {
            throw new RuntimeException("La cantidad a agregar debe ser mayor a cero");
        }
        
        product.setStock(product.getStock() + stockToAdd);
        return productRepository.save(product);
    }

    public Product reduceStock(Long productId, Integer quantityToReduce) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Producto no encontrado con ID: " + productId);
        }
        
        Product product = productOpt.get();
        if (quantityToReduce == null || quantityToReduce <= 0) {
            throw new RuntimeException("La cantidad a reducir debe ser mayor a cero");
        }
        
        if (product.getStock() < quantityToReduce) {
            throw new RuntimeException("Stock insuficiente para el producto: " + product.getNombre() + 
                ". Stock disponible: " + product.getStock() + ", cantidad solicitada: " + quantityToReduce);
        }
        
        product.setStock(product.getStock() - quantityToReduce);
        
        // Si el stock llega a 0, marcar como no disponible
        if (product.getStock() == 0) {
            product.setDisponible(false);
        }
        
        return productRepository.save(product);
    }

    private void validateProduct(Product product) {
        if (product.getNombre() == null || product.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre del producto es requerido");
        }
        if (product.getDescripcion() == null || product.getDescripcion().trim().isEmpty()) {
            throw new RuntimeException("La descripción del producto es requerida");
        }
        if (product.getPrecio() == null || product.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("El precio debe ser mayor a cero");
        }
        if (product.getStock() == null || product.getStock() < 0) {
            throw new RuntimeException("El stock no puede ser negativo");
        }
        if (product.getImagen() == null || product.getImagen().trim().isEmpty()) {
            throw new RuntimeException("La imagen del producto es requerida");
        }
        if (product.getDisponible() == null) {
            product.setDisponible(true);
        }
    }
}