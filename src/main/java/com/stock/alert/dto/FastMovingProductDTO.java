package com.stock.alert.dto;

public class FastMovingProductDTO {

    private Long productId;
    private String productName;
    private String sku;
    private Long totalSales;

    public FastMovingProductDTO() {
    }

    public FastMovingProductDTO(
            Long productId,
            String productName,
            String sku,
            Long totalSales) {

        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.totalSales = totalSales;
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

    public Long getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(Long totalSales) {
        this.totalSales = totalSales;
    }
}