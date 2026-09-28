package com.stock.alert.dto;

import com.stock.alert.entity.ReorderAlert;

import java.time.LocalDateTime;

public class ReorderAlertDTO {

    private Long alertId;
    private Long productId;
    private String productName;
    private String sku;
    private Integer reorderQuantity;
    private ReorderAlert.ReorderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime fulfilledAt;

    public ReorderAlertDTO() {
    }

    public ReorderAlertDTO(
            Long alertId,
            Long productId,
            String productName,
            String sku,
            Integer reorderQuantity,
            ReorderAlert.ReorderStatus status,
            LocalDateTime createdAt,
            LocalDateTime fulfilledAt) {

        this.alertId = alertId;
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.reorderQuantity = reorderQuantity;
        this.status = status;
        this.createdAt = createdAt;
        this.fulfilledAt = fulfilledAt;
    }

    public Long getAlertId() {
        return alertId;
    }

    public void setAlertId(Long alertId) {
        this.alertId = alertId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Integer getReorderQuantity() {
        return reorderQuantity;
    }

    public void setReorderQuantity(Integer reorderQuantity) {
        this.reorderQuantity = reorderQuantity;
    }

    public ReorderAlert.ReorderStatus getStatus() {
        return status;
    }

    public void setStatus(ReorderAlert.ReorderStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getFulfilledAt() {
        return fulfilledAt;
    }

    public void setFulfilledAt(LocalDateTime fulfilledAt) {
        this.fulfilledAt = fulfilledAt;
    }
}