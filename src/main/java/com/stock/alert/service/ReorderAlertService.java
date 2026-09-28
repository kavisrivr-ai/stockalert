package com.stock.alert.service;

import com.stock.alert.dto.ReorderAlertDTO;
import com.stock.alert.entity.Product;
import com.stock.alert.entity.ReorderAlert;
import com.stock.alert.entity.StockMovement;
import com.stock.alert.repository.ReorderAlertRepository;
import com.stock.alert.repository.StockMovementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReorderAlertService {

    private final ReorderAlertRepository reorderAlertRepository;
    private final StockMovementRepository stockMovementRepository;

    public ReorderAlertService(
            ReorderAlertRepository reorderAlertRepository,
            StockMovementRepository stockMovementRepository) {

        this.reorderAlertRepository = reorderAlertRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    // =========================================================
    // AUTOMATIC REORDER ALERT CREATION
    // =========================================================

    public void checkAndCreateAlert(Product product) {

        int currentStock = calculateCurrentStock(product.getId());

        boolean openAlertExists =
                reorderAlertRepository.existsByProductIdAndStatus(
                        product.getId(),
                        ReorderAlert.ReorderStatus.OPEN
                );

        if (currentStock <= product.getReorderThreshold()
                && !openAlertExists) {

            ReorderAlert alert = new ReorderAlert();

            alert.setProduct(product);
            alert.setReorderQuantity(product.getReorderQuantity());
            alert.setStatus(ReorderAlert.ReorderStatus.OPEN);

            reorderAlertRepository.save(alert);

            // OPTIONAL CONSOLE NOTIFICATION
            System.out.println();
            System.out.println("================================================");
            System.out.println("⚠️ REORDER ALERT CREATED");
            System.out.println("Product       : " + product.getName());
            System.out.println("SKU           : " + product.getSku());
            System.out.println("Current Stock : " + currentStock);
            System.out.println("Threshold     : " + product.getReorderThreshold());
            System.out.println("Reorder Qty   : " + product.getReorderQuantity());
            System.out.println("Status        : OPEN");
            System.out.println("================================================");
            System.out.println();
        }
    }

    // =========================================================
    // CURRENT STOCK CALCULATION
    // =========================================================

    public int calculateCurrentStock(Long productId) {

        List<StockMovement> movements =
                stockMovementRepository.findByProductId(productId);

        int stock = 0;

        for (StockMovement movement : movements) {

            if (movement.getType() ==
                    StockMovement.MovementType.IN) {

                stock += movement.getQuantity();
            }

            if (movement.getType() ==
                    StockMovement.MovementType.OUT) {

                stock -= movement.getQuantity();
            }
        }

        return stock;
    }

    // =========================================================
    // GET ALL ALERTS
    // =========================================================

    public List<ReorderAlertDTO> getAllAlerts() {

        return reorderAlertRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET OPEN ALERTS
    // =========================================================

    public List<ReorderAlertDTO> getOpenAlerts() {

        return reorderAlertRepository
                .findByStatus(ReorderAlert.ReorderStatus.OPEN)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // FULFILL REORDER ALERT
    // =========================================================

    @Transactional
    public ReorderAlertDTO fulfillAlert(Long alertId) {

        ReorderAlert alert =
                reorderAlertRepository.findById(alertId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Reorder alert not found with ID: "
                                                + alertId
                                )
                        );

        if (alert.getStatus() ==
                ReorderAlert.ReorderStatus.FULFILLED) {

            throw new RuntimeException(
                    "Reorder alert " + alertId
                            + " is already fulfilled."
            );
        }

        Product product = alert.getProduct();

        // -----------------------------------------------------
        // ADD NEW STOCK
        // -----------------------------------------------------

        StockMovement movement = new StockMovement();

        movement.setProduct(product);

        movement.setQuantity(
                alert.getReorderQuantity()
        );

        movement.setType(
                StockMovement.MovementType.IN
        );

        movement.setReason(
                StockMovement.MovementReason.PURCHASE
        );

        stockMovementRepository.save(movement);

        // -----------------------------------------------------
        // MARK ALERT AS FULFILLED
        // -----------------------------------------------------

        alert.setStatus(
                ReorderAlert.ReorderStatus.FULFILLED
        );

        alert.setFulfilledAt(
                LocalDateTime.now()
        );

        ReorderAlert savedAlert =
                reorderAlertRepository.save(alert);

        // OPTIONAL CONSOLE NOTIFICATION

        System.out.println();
        System.out.println("================================================");
        System.out.println("✅ REORDER ALERT FULFILLED");
        System.out.println("Product       : " + product.getName());
        System.out.println("SKU           : " + product.getSku());
        System.out.println("Stock Added   : "
                + alert.getReorderQuantity());
        System.out.println("Status        : FULFILLED");
        System.out.println("================================================");
        System.out.println();

        return convertToDTO(savedAlert);
    }

    // =========================================================
    // CONVERT ENTITY TO DTO
    // =========================================================

    private ReorderAlertDTO convertToDTO(
            ReorderAlert alert) {

        Product product = alert.getProduct();

        return new ReorderAlertDTO(
                alert.getId(),
                product.getId(),
                product.getName(),
                product.getSku(),
                alert.getReorderQuantity(),
                alert.getStatus(),
                alert.getCreatedAt(),
                alert.getFulfilledAt()
        );
    }
}