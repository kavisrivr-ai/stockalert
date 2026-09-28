package com.stock.alert.repository;

import com.stock.alert.entity.ReorderAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReorderAlertRepository extends JpaRepository<ReorderAlert, Long> {

    boolean existsByProductIdAndStatus(
            Long productId,
            ReorderAlert.ReorderStatus status
    );

    List<ReorderAlert> findByStatus(ReorderAlert.ReorderStatus status);

    List<ReorderAlert> findByProductId(Long productId);
}