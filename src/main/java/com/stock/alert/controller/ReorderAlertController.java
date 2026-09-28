package com.stock.alert.controller;

import com.stock.alert.dto.ReorderAlertDTO;
import com.stock.alert.service.ReorderAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reorder-alerts")
@CrossOrigin(origins = "*")
public class ReorderAlertController {

    private final ReorderAlertService reorderAlertService;

    public ReorderAlertController(
            ReorderAlertService reorderAlertService) {

        this.reorderAlertService = reorderAlertService;
    }

    /*
     * Get all reorder alerts.
     */
    @GetMapping
    public ResponseEntity<List<ReorderAlertDTO>> getAllAlerts() {

        return ResponseEntity.ok(
                reorderAlertService.getAllAlerts()
        );
    }

    /*
     * Get only OPEN reorder alerts.
     */
    @GetMapping("/open")
    public ResponseEntity<List<ReorderAlertDTO>> getOpenAlerts() {

        return ResponseEntity.ok(
                reorderAlertService.getOpenAlerts()
        );
    }

    /*
     * Fulfill a reorder alert.
     *
     * This will:
     * 1. Add reorder quantity to stock
     * 2. Create IN/PURCHASE movement
     * 3. Mark alert as FULFILLED
     */
    @PutMapping("/{id}/fulfill")
    public ResponseEntity<ReorderAlertDTO> fulfillAlert(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                reorderAlertService.fulfillAlert(id)
        );
    }
}