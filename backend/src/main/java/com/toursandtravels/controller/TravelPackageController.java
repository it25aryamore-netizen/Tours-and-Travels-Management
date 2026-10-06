package com.toursandtravels.controller;

import com.toursandtravels.entity.TravelPackage;
import com.toursandtravels.service.TravelPackageService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/packages")
public class TravelPackageController {

    private final TravelPackageService travelPackageService;

    public TravelPackageController(TravelPackageService travelPackageService) {
        this.travelPackageService = travelPackageService;
    }

    @GetMapping
    public List<TravelPackage> getAll() {
        return travelPackageService.findAll();
    }

    @GetMapping("/{id}")
    public TravelPackage getById(@PathVariable Long id) {
        return travelPackageService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TravelPackage create(@Valid @RequestBody TravelPackage travelPackage) {
        return travelPackageService.create(travelPackage);
    }

    @PutMapping("/{id}")
    public TravelPackage update(@PathVariable Long id, @Valid @RequestBody TravelPackage travelPackage) {
        return travelPackageService.update(id, travelPackage);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        travelPackageService.delete(id);
    }
}
