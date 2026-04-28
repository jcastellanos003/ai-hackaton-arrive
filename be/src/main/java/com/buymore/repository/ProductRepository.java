package com.buymore.repository;

import com.buymore.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:isFeatured IS NULL OR p.isFeatured = :isFeatured)")
    Page<Product> findWithFilters(
            @Param("category") String category,
            @Param("search") String search,
            @Param("isFeatured") Boolean isFeatured,
            Pageable pageable
    );

    List<Product> findTop4ByCategoryAndIdNot(String category, UUID id);

    @Query("SELECT p.category as name, COUNT(p) as count FROM Product p GROUP BY p.category ORDER BY p.category")
    List<CategoryCount> findCategoryCounts();

    interface CategoryCount {
        String getName();
        Long getCount();
    }
}
