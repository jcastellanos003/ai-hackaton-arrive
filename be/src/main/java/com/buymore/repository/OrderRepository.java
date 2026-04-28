package com.buymore.repository;

import com.buymore.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<CustomerOrder, UUID> {

    @Query("SELECT COUNT(o) FROM CustomerOrder o WHERE o.createdAt >= :start AND o.createdAt < :end")
    long countByCreatedAtBetween(
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end
    );
}
