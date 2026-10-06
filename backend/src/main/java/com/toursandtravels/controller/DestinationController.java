package com.toursandtravels.controller;

import com.toursandtravels.entity.Destination;
import com.toursandtravels.service.DestinationService;
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
@RequestMapping("/api/destinations")
public class DestinationController {

    private final DestinationService destinationService;

    public DestinationController(DestinationService destinationService) {
        this.destinationService = destinationService;
    }

    @GetMapping
    public List<Destination> getAll() {
        return destinationService.findAll();
    }

    @GetMapping("/{id}")
    public Destination getById(@PathVariable Long id) {
        return destinationService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Destination create(@Valid @RequestBody Destination destination) {
        return destinationService.create(destination);
    }

    @PutMapping("/{id}")
    public Destination update(@PathVariable Long id, @Valid @RequestBody Destination destination) {
        return destinationService.update(id, destination);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        destinationService.delete(id);
    }
}
