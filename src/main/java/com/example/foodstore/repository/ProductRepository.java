package com.example.foodstore.repository;

import com.example.foodstore.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Buscar productos por categoría
    List<Product> findByCategoriaId(Long categoriaId);
    
    // Buscar productos disponibles
    List<Product> findByDisponibleTrue();
    
    // Buscar productos por nombre (búsqueda)
    List<Product> findByNombreContainingIgnoreCase(String nombre);
    
    // Buscar productos disponibles por categoría
    List<Product> findByCategoriaIdAndDisponibleTrue(Long categoriaId);
    
    // Buscar productos con stock mayor a 0
    List<Product> findByStockGreaterThan(Integer stock);
    
    // Búsqueda combinada: nombre y disponible
    @Query("SELECT p FROM Product p WHERE " +
           "(:nombre IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND " +
           "(:categoriaId IS NULL OR p.categoria.id = :categoriaId) AND " +
           "(:disponible IS NULL OR p.disponible = :disponible)")
    List<Product> findProductsWithFilters(@Param("nombre") String nombre, 
                                         @Param("categoriaId") Long categoriaId,
                                         @Param("disponible") Boolean disponible);
}