package com.toursandtravels.controller;

import com.toursandtravels.entity.Booking;
import com.toursandtravels.entity.Customer;
import com.toursandtravels.service.CustomerService;
import com.toursandtravels.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final CustomerService customerService;

    public BookingController(BookingService bookingService, CustomerService customerService) {
        this.bookingService = bookingService;
        this.customerService = customerService;
    }

    @GetMapping
    public List<Booking> getAll(Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities()
                .contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        return isAdmin ? bookingService.findAll() : bookingService.findAllForCustomer(authentication.getName());
    }

    @GetMapping("/{id}")
    public Booking getById(@PathVariable Long id, Authentication authentication) {
        Booking booking = bookingService.findById(id);
        verifyCustomerAccess(booking.getCustomer().getEmail(), authentication);
        return booking;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking create(@Valid @RequestBody Booking booking, Authentication authentication) {
        if (booking.getCustomer() == null || booking.getCustomer().getId() == null) {
            throw new IllegalArgumentException("A customer ID is required for a booking.");
        }

        Customer customer = customerService.findById(booking.getCustomer().getId());
        verifyCustomerAccess(customer.getEmail(), authentication);
        return bookingService.create(booking);
    }

    @PutMapping("/{id}")
    public Booking update(@PathVariable Long id, @Valid @RequestBody Booking booking) {
        return bookingService.update(id, booking);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        bookingService.delete(id);
    }

    private void verifyCustomerAccess(String customerEmail, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities()
                .contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        if (!isAdmin && !customerEmail.equalsIgnoreCase(authentication.getName())) {
            throw new AccessDeniedException("Customers can only access their own bookings.");
        }
    }
}
