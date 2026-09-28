package com.stock.alert.dto;

import com.stock.alert.entity.StockMovement;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class StockMovementRequest {

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Integer quantity;

    @NotNull(message = "Movement type is required")
    private StockMovement.MovementType type;

    @NotNull(message = "Movement reason is required")
    private StockMovement.MovementReason reason;

    public StockMovementRequest() {
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public StockMovement.MovementType getType() {
        return type;
    }

    public void setType(StockMovement.MovementType type) {
        this.type = type;
    }

    public StockMovement.MovementReason getReason() {
        return reason;
    }

    public void setReason(StockMovement.MovementReason reason) {
        this.reason = reason;
    }
}