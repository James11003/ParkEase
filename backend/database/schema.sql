-- ParkEase Database Schema (v2 — Buildings & Floors)
-- Run this in phpMyAdmin or MySQL CLI

DROP DATABASE IF EXISTS parkease;
CREATE DATABASE parkease;
USE parkease;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    vehicle_number VARCHAR(20),
    vehicle_type ENUM('Bike', 'Car'),
    auth_token VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buildings table
CREATE TABLE buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Floors table
CREATE TABLE floors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    floor_number INT NOT NULL,
    floor_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_floor (building_id, floor_number)
);

-- Parking slots table (zone replaced by floor_id)
CREATE TABLE parking_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    floor_id INT NOT NULL,
    slot_number VARCHAR(30) NOT NULL UNIQUE,
    status ENUM('available', 'occupied', 'unavailable') DEFAULT 'available',
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    booking_status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES parking_slots(id) ON DELETE CASCADE
);

-- =====================
-- Seed Data
-- =====================

-- Admin user (password: password)
INSERT INTO users (name, email, password, role, vehicle_number, vehicle_type)
VALUES ('Admin', 'admin@parkease.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'ADMIN01', 'Car');

-- Sample users (password: password)
INSERT INTO users (name, email, password, role, vehicle_number, vehicle_type) VALUES
('Rahul Kumar',  'rahul@college.edu',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'TN01AB1234', 'Bike'),
('Priya Sharma', 'priya@college.edu',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'TN02CD5678', 'Car'),
('Arun Vijay',   'arun@college.edu',   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'TN03EF9012', 'Bike'),
('Divya Nair',   'divya@college.edu',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'TN04GH3456', 'Car');

-- Buildings: Block A (4 floors), Block B (3 floors), Block C (5 floors)
INSERT INTO buildings (name) VALUES ('Block A'), ('Block B'), ('Block C');

-- Floors for Block A (4 floors)
INSERT INTO floors (building_id, floor_number, floor_name) VALUES
(1, 1, 'Ground Floor'), (1, 2, 'Floor 1'), (1, 3, 'Floor 2'), (1, 4, 'Floor 3');

-- Floors for Block B (3 floors)
INSERT INTO floors (building_id, floor_number, floor_name) VALUES
(2, 1, 'Ground Floor'), (2, 2, 'Floor 1'), (2, 3, 'Floor 2');

-- Floors for Block C (5 floors)
INSERT INTO floors (building_id, floor_number, floor_name) VALUES
(3, 1, 'Ground Floor'), (3, 2, 'Floor 1'), (3, 3, 'Floor 2'), (3, 4, 'Floor 3'), (3, 5, 'Floor 4');

-- Generate 25 slots per floor
-- Block A: floor_ids 1-4, Block B: 5-7, Block C: 8-12
-- Naming: A-G-01 ... A-F3-25 etc.

-- Helper: Block A Ground Floor (floor_id=1) => slots A-GF-01 to A-GF-25
INSERT INTO parking_slots (floor_id, slot_number) VALUES
(1,'A-GF-01'),(1,'A-GF-02'),(1,'A-GF-03'),(1,'A-GF-04'),(1,'A-GF-05'),
(1,'A-GF-06'),(1,'A-GF-07'),(1,'A-GF-08'),(1,'A-GF-09'),(1,'A-GF-10'),
(1,'A-GF-11'),(1,'A-GF-12'),(1,'A-GF-13'),(1,'A-GF-14'),(1,'A-GF-15'),
(1,'A-GF-16'),(1,'A-GF-17'),(1,'A-GF-18'),(1,'A-GF-19'),(1,'A-GF-20'),
(1,'A-GF-21'),(1,'A-GF-22'),(1,'A-GF-23'),(1,'A-GF-24'),(1,'A-GF-25');

-- Block A Floor 1 (floor_id=2)
INSERT INTO parking_slots (floor_id, slot_number) VALUES
(2,'A-F1-01'),(2,'A-F1-02'),(2,'A-F1-03'),(2,'A-F1-04'),(2,'A-F1-05'),
(2,'A-F1-06'),(2,'A-F1-07'),(2,'A-F1-08'),(2,'A-F1-09'),(2,'A-F1-10'),
(2,'A-F1-11'),(2,'A-F1-12'),(2,'A-F1-13'),(2,'A-F1-14'),(2,'A-F1-15'),
(2,'A-F1-16'),(2,'A-F1-17'),(2,'A-F1-18'),(2,'A-F1-19'),(2,'A-F1-20'),
(2,'A-F1-21'),(2,'A-F1-22'),(2,'A-F1-23'),(2,'A-F1-24'),(2,'A-F1-25');

-- Block A Floor 2 (floor_id=3)
INSERT INTO parking_slots (floor_id, slot_number) VALUES
(3,'A-F2-01'),(3,'A-F2-02'),(3,'A-F2-03'),(3,'A-F2-04'),(3,'A-F2-05'),
(3,'A-F2-06'),(3,'A-F2-07'),(3,'A-F2-08'),(3,'A-F2-09'),(3,'A-F2-10'),
(3,'A-F2-11'),(3,'A-F2-12'),(3,'A-F2-13'),(3,'A-F2-14'),(3,'A-F2-15'),
(3,'A-F2-16'),(3,'A-F2-17'),(3,'A-F2-18'),(3,'A-F2-19'),(3,'A-F2-20'),
(3,'A-F2-21'),(3,'A-F2-22'),(3,'A-F2-23'),(3,'A-F2-24'),(3,'A-F2-25');

-- Block A Floor 3 (floor_id=4)
INSERT INTO parking_slots (floor_id, slot_number) VALUES
(4,'A-F3-01'),(4,'A-F3-02'),(4,'A-F3-03'),(4,'A-F3-04'),(4,'A-F3-05'),
(4,'A-F3-06'),(4,'A-F3-07'),(4,'A-F3-08'),(4,'A-F3-09'),(4,'A-F3-10'),
(4,'A-F3-11'),(4,'A-F3-12'),(4,'A-F3-13'),(4,'A-F3-14'),(4,'A-F3-15'),
(4,'A-F3-16'),(4,'A-F3-17'),(4,'A-F3-18'),(4,'A-F3-19'),(4,'A-F3-20'),
(4,'A-F3-21'),(4,'A-F3-22'),(4,'A-F3-23'),(4,'A-F3-24'),(4,'A-F3-25');

-- Block B Ground Floor (floor_id=5)
INSERT INTO parking_slots (floor_id, slot_number) VALUES
(5,'B-GF-01'),(5,'B-GF-02'),(5,'B-GF-03'),(5,'B-GF-04'),(5,'B-GF-05'),
(5,'B-GF-06'),(5,'B-GF-07'),(5,'B-GF-08'),(5,'B-GF-09'),(5,'B-GF-10'),
(5,'B-GF-11'),(5,'B-GF-12'),(5,'B-GF-13'),(5,'B-GF-14'),(5,'B-GF-15'),
(5,'B-GF-16'),(5,'B-GF-17'),(5,'B-GF-18'),(5,'B-GF-19'),(5,'B-GF-20'),
(5,'B-GF-21'),(5,'B-GF-22'),(5,'B-GF-23'),(5,'B-GF-24'),(5,'B-GF-25');

-- Block B Floor 1 (floor_id=6)
INSERT INTO parking_slots (floor_id, slot_number) VALUES
(6,'B-F1-01'),(6,'B-F1-02'),(6,'B-F1-03'),(6,'B-F1-04'),(6,'B-F1-05'),
(6,'B-F1-06'),(6,'B-F1-07'),(6,'B-F1-08'),(6,'B-F1-09'),(6,'B-F1-10'),
(6,'B-F1-11'),(6,'B-F1-12'),(6,'B-F1-13'),(6,'B-F1-14'),(6,'B-F1-15'),
(6,'B-F1-16'),(6,'B-F1-17'),(6,'B-F1-18'),(6,'B-F1-19'),(6,'B-F1-20'),
(6,'B-F1-21'),(6,'B-F1-22'),(6,'B-F1-23'),(6,'B-F1-24'),(6,'B-F1-25');

-- Block B Floor 2 (floor_id=7)
INSERT INTO parking_slots (floor_id, slot_number) VALUES
(7,'B-F2-01'),(7,'B-F2-02'),(7,'B-F2-03'),(7,'B-F2-04'),(7,'B-F2-05'),
(7,'B-F2-06'),(7,'B-F2-07'),(7,'B-F2-08'),(7,'B-F2-09'),(7,'B-F2-10'),
(7,'B-F2-11'),(7,'B-F2-12'),(7,'B-F2-13'),(7,'B-F2-14'),(7,'B-F2-15'),
(7,'B-F2-16'),(7,'B-F2-17'),(7,'B-F2-18'),(7,'B-F2-19'),(7,'B-F2-20'),
(7,'B-F2-21'),(7,'B-F2-22'),(7,'B-F2-23'),(7,'B-F2-24'),(7,'B-F2-25');

-- Block C Ground Floor (floor_id=8)
INSERT INTO parking_slots (floor_id, slot_number) VALUES
(8,'C-GF-01'),(8,'C-GF-02'),(8,'C-GF-03'),(8,'C-GF-04'),(8,'C-GF-05'),
(8,'C-GF-06'),(8,'C-GF-07'),(8,'C-GF-08'),(8,'C-GF-09'),(8,'C-GF-10'),
(8,'C-GF-11'),(8,'C-GF-12'),(8,'C-GF-13'),(8,'C-GF-14'),(8,'C-GF-15'),
(8,'C-GF-16'),(8,'C-GF-17'),(8,'C-GF-18'),(8,'C-GF-19'),(8,'C-GF-20'),
(8,'C-GF-21'),(8,'C-GF-22'),(8,'C-GF-23'),(8,'C-GF-24'),(8,'C-GF-25');

-- Block C Floor 1 (floor_id=9)
INSERT INTO parking_slots (floor_id, slot_number) VALUES
(9,'C-F1-01'),(9,'C-F1-02'),(9,'C-F1-03'),(9,'C-F1-04'),(9,'C-F1-05'),
(9,'C-F1-06'),(9,'C-F1-07'),(9,'C-F1-08'),(9,'C-F1-09'),(9,'C-F1-10'),
(9,'C-F1-11'),(9,'C-F1-12'),(9,'C-F1-13'),(9,'C-F1-14'),(9,'C-F1-15'),
(9,'C-F1-16'),(9,'C-F1-17'),(9,'C-F1-18'),(9,'C-F1-19'),(9,'C-F1-20'),
(9,'C-F1-21'),(9,'C-F1-22'),(9,'C-F1-23'),(9,'C-F1-24'),(9,'C-F1-25');

-- Block C Floor 2 (floor_id=10)
INSERT INTO parking_slots (floor_id, slot_number) VALUES
(10,'C-F2-01'),(10,'C-F2-02'),(10,'C-F2-03'),(10,'C-F2-04'),(10,'C-F2-05'),
(10,'C-F2-06'),(10,'C-F2-07'),(10,'C-F2-08'),(10,'C-F2-09'),(10,'C-F2-10'),
(10,'C-F2-11'),(10,'C-F2-12'),(10,'C-F2-13'),(10,'C-F2-14'),(10,'C-F2-15'),
(10,'C-F2-16'),(10,'C-F2-17'),(10,'C-F2-18'),(10,'C-F2-19'),(10,'C-F2-20'),
(10,'C-F2-21'),(10,'C-F2-22'),(10,'C-F2-23'),(10,'C-F2-24'),(10,'C-F2-25');

-- Block C Floor 3 (floor_id=11)
INSERT INTO parking_slots (floor_id, slot_number) VALUES
(11,'C-F3-01'),(11,'C-F3-02'),(11,'C-F3-03'),(11,'C-F3-04'),(11,'C-F3-05'),
(11,'C-F3-06'),(11,'C-F3-07'),(11,'C-F3-08'),(11,'C-F3-09'),(11,'C-F3-10'),
(11,'C-F3-11'),(11,'C-F3-12'),(11,'C-F3-13'),(11,'C-F3-14'),(11,'C-F3-15'),
(11,'C-F3-16'),(11,'C-F3-17'),(11,'C-F3-18'),(11,'C-F3-19'),(11,'C-F3-20'),
(11,'C-F3-21'),(11,'C-F3-22'),(11,'C-F3-23'),(11,'C-F3-24'),(11,'C-F3-25');

-- Block C Floor 4 (floor_id=12)
INSERT INTO parking_slots (floor_id, slot_number) VALUES
(12,'C-F4-01'),(12,'C-F4-02'),(12,'C-F4-03'),(12,'C-F4-04'),(12,'C-F4-05'),
(12,'C-F4-06'),(12,'C-F4-07'),(12,'C-F4-08'),(12,'C-F4-09'),(12,'C-F4-10'),
(12,'C-F4-11'),(12,'C-F4-12'),(12,'C-F4-13'),(12,'C-F4-14'),(12,'C-F4-15'),
(12,'C-F4-16'),(12,'C-F4-17'),(12,'C-F4-18'),(12,'C-F4-19'),(12,'C-F4-20'),
(12,'C-F4-21'),(12,'C-F4-22'),(12,'C-F4-23'),(12,'C-F4-24'),(12,'C-F4-25');
