package com.example.foodstore.service;

import com.example.foodstore.model.Categoria;
import com.example.foodstore.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<Categoria> findAll() {
        return categoriaRepository.findAll();
    }

    public Optional<Categoria> findById(Long id) {
        return categoriaRepository.findById(id);
    }

    public Categoria save(Categoria categoria) {
        if (categoria.getNombre() == null || categoria.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre de la categoría es requerido");
        }
        if (categoria.getDescripcion() == null || categoria.getDescripcion().trim().isEmpty()) {
            throw new RuntimeException("La descripción de la categoría es requerida");
        }
        if (categoria.getImagen() == null || categoria.getImagen().trim().isEmpty()) {
            throw new RuntimeException("La imagen de la categoría es requerida");
        }

        if (categoria.getId() == null && categoriaRepository.existsByNombre(categoria.getNombre())) {
            throw new RuntimeException("Ya existe una categoría con ese nombre");
        }

        return categoriaRepository.save(categoria);
    }

    public Categoria update(Long id, Categoria categoriaActualizada) {
        Optional<Categoria> existingCategoria = categoriaRepository.findById(id);
        if (existingCategoria.isEmpty()) {
            throw new RuntimeException("Categoría no encontrada");
        }

        Categoria categoria = existingCategoria.get();
        categoria.setNombre(categoriaActualizada.getNombre());
        categoria.setDescripcion(categoriaActualizada.getDescripcion());
        categoria.setImagen(categoriaActualizada.getImagen());

        return save(categoria);
    }

    public void deleteById(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("Categoría no encontrada");
        }
        categoriaRepository.deleteById(id);
    }

    public List<Categoria> searchByName(String nombre) {
        return categoriaRepository.findByNombreContainingIgnoreCase(nombre);
    }
}