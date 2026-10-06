package com.toursandtravels.service;

import com.toursandtravels.entity.Destination;
import com.toursandtravels.entity.TravelPackage;
import com.toursandtravels.exception.ResourceNotFoundException;
import com.toursandtravels.repository.DestinationRepository;
import com.toursandtravels.repository.TravelPackageRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TravelPackageService {

    private final TravelPackageRepository travelPackageRepository;
    private final DestinationRepository destinationRepository;

    public TravelPackageService(
            TravelPackageRepository travelPackageRepository,
            DestinationRepository destinationRepository) {
        this.travelPackageRepository = travelPackageRepository;
        this.destinationRepository = destinationRepository;
    }

    public List<TravelPackage> findAll() {
        return travelPackageRepository.findAll();
    }

    public TravelPackage findById(Long id) {
        return travelPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Travel package " + id + " was not found."));
    }

    public TravelPackage create(TravelPackage travelPackage) {
        travelPackage.setId(null);
        travelPackage.setDestination(findDestination(travelPackage));
        return travelPackageRepository.save(travelPackage);
    }

    public TravelPackage update(Long id, TravelPackage updatedPackage) {
        TravelPackage travelPackage = findById(id);
        travelPackage.setName(updatedPackage.getName());
        travelPackage.setDestination(findDestination(updatedPackage));
        travelPackage.setDescription(updatedPackage.getDescription());
        travelPackage.setDuration(updatedPackage.getDuration());
        travelPackage.setPrice(updatedPackage.getPrice());
        travelPackage.setAvailability(updatedPackage.getAvailability());
        return travelPackageRepository.save(travelPackage);
    }

    public void delete(Long id) {
        travelPackageRepository.delete(findById(id));
    }

    private Destination findDestination(TravelPackage travelPackage) {
        if (travelPackage.getDestination() == null || travelPackage.getDestination().getId() == null) {
            throw new IllegalArgumentException("A destination ID is required for a travel package.");
        }

        Long destinationId = travelPackage.getDestination().getId();
        return destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination " + destinationId + " was not found."));
    }
}
