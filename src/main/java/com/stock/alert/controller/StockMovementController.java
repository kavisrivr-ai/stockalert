package com.stock.alert.controller;

import com.stock.alert.dto.StockMovementRequest;
import com.stock.alert.entity.StockMovement;
import com.stock.alert.service.StockMovementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
@CrossOrigin
public class StockMovementController {

    private final StockMovementService stockMovementService;

    public StockMovementController(
            StockMovementService stockMovementService) {

        this.stockMovementService = stockMovementService;
    }

    // Add Stock Movement
    @PostMapping("/product/{productId}")
    public ResponseEntity<StockMovement> addMovement(
            @PathVariable Long productId,
            @Valid @RequestBody StockMovementRequest request) {

        StockMovement movement = new StockMovement();

        movement.setQuantity(request.getQuantity());
        movement.setType(request.getType());
        movement.setReason(request.getReason());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        stockMovementService.addMovement(
                                productId,
                                movement
                        )
                );
    }

    // Get All Stock Movements
    @GetMapping
    public ResponseEntity<List<StockMovement>> getAllMovements() {

        return ResponseEntity.ok(
                stockMovementService.getAllMovements()
        );
    }

    // Get Movements For One Product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockMovement>> getProductMovements(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                stockMovementService.getProductMovements(productId)
        );
    }

    // Get Current Stock
    @GetMapping("/product/{productId}/current-stock")
    public ResponseEntity<Integer> getCurrentStock(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                stockMovementService.getCurrentStock(productId)
        );
    }
}