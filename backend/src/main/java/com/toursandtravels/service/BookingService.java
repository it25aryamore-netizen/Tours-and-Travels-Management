package com.toursandtravels.service;

import com.toursandtravels.entity.Booking;
import com.toursandtravels.entity.Customer;
import com.toursandtravels.entity.TravelPackage;
import com.toursandtravels.exception.ResourceNotFoundException;
import com.toursandtravels.repository.BookingRepository;
import com.toursandtravels.repository.CustomerRepository;
import com.toursandtravels.repository.TravelPackageRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final TravelPackageRepository travelPackageRepository;

    public BookingService(
            BookingRepository bookingRepository,
            CustomerRepository customerRepository,
            TravelPackageRepository travelPackageRepository) {
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.travelPackageRepository = travelPackageRepository;
    }

    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }

    public List<Booking> findAllForCustomer(String email) {
        return bookingRepository.findAllByCustomer_EmailIgnoreCase(email);
    }

    public Booking findById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking " + id + " was not found."));
    }

    public Booking create(Booking booking) {
        booking.setId(null);
        setRelatedRecords(booking);
        if (booking.getBookingStatus() == null || booking.getBookingStatus().isBlank()) {
            booking.setBookingStatus("PENDING");
        }
        return bookingRepository.save(booking);
    }

    public Booking update(Long id, Booking updatedBooking) {
        Booking booking = findById(id);
        setRelatedRecords(updatedBooking);
        booking.setCustomer(updatedBooking.getCustomer());
        booking.setTravelPackage(updatedBooking.getTravelPackage());
        booking.setNumberOfTravelers(updatedBooking.getNumberOfTravelers());
        booking.setTravelDate(updatedBooking.getTravelDate());
        booking.setBookingStatus(updatedBooking.getBookingStatus());
        return bookingRepository.save(booking);
    }

    public void delete(Long id) {
        bookingRepository.delete(findById(id));
    }

    private void setRelatedRecords(Booking booking) {
        if (booking.getCustomer() == null || booking.getCustomer().getId() == null) {
            throw new IllegalArgumentException("A customer ID is required for a booking.");
        }
        if (booking.getTravelPackage() == null || booking.getTravelPackage().getId() == null) {
            throw new IllegalArgumentException("A travel package ID is required for a booking.");
        }

        Long customerId = booking.getCustomer().getId();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer " + customerId + " was not found."));

        Long packageId = booking.getTravelPackage().getId();
        TravelPackage travelPackage = travelPackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel package " + packageId + " was not found."));

        booking.setCustomer(customer);
        booking.setTravelPackage(travelPackage);
    }
}
