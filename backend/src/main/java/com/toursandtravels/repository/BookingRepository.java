package com.toursandtravels.repository;

import com.toursandtravels.entity.Booking;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findAllByCustomer_EmailIgnoreCase(String email);
}
