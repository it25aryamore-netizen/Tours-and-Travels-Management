package com.toursandtravels.service;

import com.toursandtravels.entity.Destination;
import com.toursandtravels.exception.ResourceNotFoundException;
import com.toursandtravels.repository.DestinationRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DestinationService {

    private final DestinationRepository destinationRepository;

    public DestinationService(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    public List<Destination> findAll() {
        return destinationRepository.findAll();
    }

    public Destination findById(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination " + id + " was not found."));
    }

    public Destination create(Destination destination) {
        destination.setId(null);
        return destinationRepository.save(destination);
    }

    public Destination update(Long id, Destination updatedDestination) {
        Destination destination = findById(id);
        destination.setName(updatedDestination.getName());
        destination.setDescription(updatedDestination.getDescription());
        destination.setLocation(updatedDestination.getLocation());
        destination.setImageUrl(updatedDestination.getImageUrl());
        return destinationRepository.save(destination);
    }

    public void delete(Long id) {
        destinationRepository.delete(findById(id));
    }
}
