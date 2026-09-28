package com.stock.alert.service;

import com.stock.alert.entity.Product;
import com.stock.alert.entity.StockMovement;
import com.stock.alert.repository.ProductRepository;
import com.stock.alert.repository.StockMovementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;
    private final ReorderAlertService reorderAlertService;

    public StockMovementService(
            StockMovementRepository stockMovementRepository,
            ProductRepository productRepository,
            ReorderAlertService reorderAlertService) {

        this.stockMovementRepository = stockMovementRepository;
        this.productRepository = productRepository;
        this.reorderAlertService = reorderAlertService;
    }

    public StockMovement addMovement(
            Long productId,
            StockMovement movement) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found with ID: " + productId));

        movement.setProduct(product);

        StockMovement savedMovement =
                stockMovementRepository.save(movement);

        reorderAlertService.checkAndCreateAlert(product);

        return savedMovement;
    }

    public List<StockMovement> getAllMovements() {
        return stockMovementRepository.findAll();
    }

    public List<StockMovement> getProductMovements(Long productId) {

        if (!productRepository.existsById(productId)) {
            throw new RuntimeException(
                    "Product not found with ID: " + productId);
        }

        return stockMovementRepository.findByProductId(productId);
    }

    public int getCurrentStock(Long productId) {

        List<StockMovement> movements =
                stockMovementRepository.findByProductId(productId);

        int stock = 0;

        for (StockMovement movement : movements) {

            if (movement.getType() == StockMovement.MovementType.IN) {
                stock += movement.getQuantity();
            } else {
                stock -= movement.getQuantity();
            }
        }

        return stock;
    }
}