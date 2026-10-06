CREATE DATABASE IF NOT EXISTS tours_travels_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE tours_travels_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(16) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customers (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_customers_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS destinations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    image_url VARCHAR(2048),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS travel_packages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    destination_id BIGINT NOT NULL,
    description VARCHAR(255) NOT NULL,
    duration VARCHAR(64) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    availability INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_travel_packages_destination
        FOREIGN KEY (destination_id) REFERENCES destinations (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT NOT NULL AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    travel_package_id BIGINT NOT NULL,
    number_of_travelers INT NOT NULL,
    travel_date DATE NOT NULL,
    booking_status VARCHAR(24) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_bookings_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_travel_package
        FOREIGN KEY (travel_package_id) REFERENCES travel_packages (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;
