package com.toursandtravels.service;

import com.toursandtravels.entity.Customer;
import com.toursandtravels.exception.ResourceNotFoundException;
import com.toursandtravels.repository.CustomerRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    public Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer " + id + " was not found."));
    }

    public Optional<Customer> findByEmail(String email) {
        return customerRepository.findByEmailIgnoreCase(email);
    }

    public Customer create(Customer customer) {
        customer.setId(null);
        return customerRepository.save(customer);
    }

    public Customer update(Long id, Customer updatedCustomer) {
        Customer customer = findById(id);
        customer.setName(updatedCustomer.getName());
        customer.setEmail(updatedCustomer.getEmail());
        customer.setPhone(updatedCustomer.getPhone());
        return customerRepository.save(customer);
    }

    public void delete(Long id) {
        customerRepository.delete(findById(id));
    }
}
