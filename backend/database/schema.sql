-- ==========================================================
-- College Laboratory Equipment Management System (Lab EMS)
-- Database Schema (MySQL Compatible)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS lab_ems_db;
USE lab_ems_db;

-- 1. Users Table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('Admin', 'Faculty', 'Student') NOT NULL DEFAULT 'Student',
    department VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Laboratories Table
DROP TABLE IF EXISTS laboratories;
CREATE TABLE laboratories (
    lab_id INT AUTO_INCREMENT PRIMARY KEY,
    lab_name VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 30,
    in_charge VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Equipment Table
DROP TABLE IF EXISTS equipment;
CREATE TABLE equipment (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    lab_id INT NOT NULL,
    status ENUM('Available', 'In Use', 'Under Maintenance', 'Damaged') NOT NULL DEFAULT 'Available',
    purchase_date DATE,
    warranty VARCHAR(50) DEFAULT '3 Years',
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (lab_id) REFERENCES laboratories(lab_id) ON DELETE CASCADE
);

-- 5. Equipment Allocations Table
DROP TABLE IF EXISTS allocations;
CREATE TABLE allocations (
    allocation_id INT AUTO_INCREMENT PRIMARY KEY,
    allocation_code VARCHAR(20) NOT NULL UNIQUE,
    equipment_id INT NOT NULL,
    allocated_to_name VARCHAR(100) NOT NULL,
    allocated_to_role VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    purpose TEXT,
    status ENUM('Active', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Active',
    returned_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id) ON DELETE CASCADE
);

-- 6. Maintenance & Damage Reports Table
DROP TABLE IF EXISTS maintenance;
CREATE TABLE maintenance (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    maintenance_code VARCHAR(20) NOT NULL UNIQUE,
    equipment_id INT NOT NULL,
    issue_description TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
    reported_by VARCHAR(100) NOT NULL,
    reported_date DATE NOT NULL,
    resolved_date DATE,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('Under Maintenance', 'In Progress', 'Resolved', 'Cancelled') NOT NULL DEFAULT 'Under Maintenance',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id) ON DELETE CASCADE
);

-- ==========================================================
-- SEED INITIAL DATA (Matching UI Mockups)
-- ==========================================================

-- Seed Users
INSERT INTO users (username, password, full_name, email, role, department) VALUES
('admin', 'admin123', 'Administrator', 'admin@college.edu', 'Admin', 'Computer Science'),
('faculty1', 'faculty123', 'Dr. Ramesh Kumar', 'ramesh@college.edu', 'Faculty', 'Computer Science'),
('faculty2', 'faculty123', 'Prof. Sunita Rao', 'sunita@college.edu', 'Faculty', 'ECE'),
('24691A05J1', 'student123', 'SHAIK IRFAN', '24691A05J1@college.edu', 'Student', 'CSE'),
('24691A05J2', 'student123', 'EDAGOTTI JAGADEESH', '24691A05J2@college.edu', 'Student', 'CSE'),
('24691A05J3', 'student123', 'NARU JAGADEESH', '24691A05J3@college.edu', 'Student', 'CSE'),
('24691A05J4', 'student123', 'BARAKI JAHNAVI', '24691A05J4@college.edu', 'Student', 'CSE'),
('24691A05J5', 'student123', 'BATHULA JAHNAVI', '24691A05J5@college.edu', 'Student', 'CSE'),
('24691A05J6', 'student123', 'KONDA JAHNAVI', '24691A05J6@college.edu', 'Student', 'CSE'),
('24691A05J7', 'student123', 'KOTHAPALLI BHARATH REDDY', '24691A05J7@college.edu', 'Student', 'CSE');

-- Seed Laboratories
INSERT INTO laboratories (lab_name, department, location, capacity, in_charge) VALUES
('CSE Lab', 'Computer Science', 'Block A, 2nd Floor', 45, 'Dr. Ramesh Kumar'),
('Networking Lab', 'Information Technology', 'Block B, 1st Floor', 35, 'Mr. Anand Verma'),
('ECE Lab', 'Electronics & Comm', 'Block C, Ground Floor', 40, 'Prof. Sunita Rao'),
('Admin Lab', 'Administration', 'Main Building, Room 102', 20, 'Mrs. Lakshmi Devi'),
('Seminar Hall', 'General', 'Auditorium Complex', 100, 'Dr. V. Prasad');

-- Seed Categories
INSERT INTO categories (category_name, description) VALUES
('Computer', 'Desktop computers, laptops, monitors, workstations and peripherals'),
('Networking', 'Routers, switches, patch panels, firewalls, and networking tools'),
('Electronics', 'Oscilloscopes, function generators, multimeters, microcontrollers'),
('Software', 'Development IDEs, Simulation tool licenses, OS licenses'),
('Others', 'Projectors, printers, scanners, UPS, interactive displays');

-- Seed Equipment
INSERT INTO equipment (equipment_code, name, category_id, lab_id, status, purchase_date, warranty, model_number, serial_number, description, image_url) VALUES
('EQ001', 'Dell Desktop', 1, 1, 'Available', '2024-08-12', '3 Years', 'OptiPlex 7090', 'DL-7090-8812', 'Dell OptiPlex Desktop with 8GB RAM, 512GB SSD, Intel Core i7 processor for student programming laboratory.', '/assets/dell_desktop.png'),
('EQ002', 'Cisco Switch', 2, 2, 'In Use', '2024-06-15', '5 Years', 'Catalyst 2960X', 'CS-2960-4491', '24-port Gigabit managed network switch used for LAN configuration and CCNA practical experiments.', '/assets/cisco_switch.png'),
('EQ003', 'Oscilloscope', 3, 3, 'Under Maintenance', '2023-11-20', '2 Years', 'Keysight DSOX1102G', 'KS-1102-7723', '100 MHz 2-Channel Digital Storage Oscilloscope for waveform analysis and circuit debugging.', '/assets/oscilloscope.png'),
('EQ004', 'Printer', 5, 4, 'Available', '2024-01-10', '1 Year', 'HP LaserJet Pro M404dn', 'HP-M404-3310', 'High-speed duplex monochrome laser printer for lab documentation and departmental report printing.', '/assets/printer.png'),
('EQ005', 'Projector', 5, 5, 'Damaged', '2023-09-05', '2 Years', 'Epson EB-X06 XGA', 'EP-X06-9905', 'Epson 3600 Lumens HDMI presentation projector mounted in the central seminar hall.', '/assets/projector.png'),
('EQ006', 'HP Workstation', 1, 1, 'In Use', '2024-03-22', '3 Years', 'HP Z2 Tower G9', 'HP-Z2-5511', 'Intel Core i9, 32GB RAM, NVIDIA RTX 4000 GPU for Machine Learning and Graphics lab practicals.', '/assets/hp_workstation.png'),
('EQ007', 'Wi-Fi Access Point', 2, 2, 'Available', '2024-05-18', '3 Years', 'Aruba AP-505', 'AR-505-1204', 'Dual-radio Wi-Fi 6 enterprise access point for networking infrastructure.', '/assets/access_point.png'),
('EQ008', 'Function Generator', 3, 3, 'Available', '2023-12-01', '2 Years', 'Rigol DG1022Z', 'RG-1022-8819', '25 MHz Arbitrary Waveform Generator with dual independent output channels.', '/assets/function_gen.png'),
('EQ009', 'MATLAB Campus License', 4, 1, 'In Use', '2024-01-01', 'Annual Subscription', 'MATLAB R2024b', 'LIC-MTLB-2024', 'Concurrent network license with Simulink, Signal Processing, and Deep Learning toolboxes.', '/assets/software_lic.png'),
('EQ010', 'Dell Laptop', 1, 1, 'Available', '2024-10-01', '3 Years', 'Latitude 5440', 'DL-5440-6677', 'High performance laptop for student and faculty research projects.', '/assets/dell_laptop.png');

-- Seed Allocations
INSERT INTO allocations (allocation_code, equipment_id, allocated_to_name, allocated_to_role, department, from_date, to_date, purpose, status, returned_date) VALUES
('A001', 1, 'SHAIK IRFAN', 'Student (CSE)', 'CSE', '2026-09-01', '2026-09-30', 'Final Year Mini Project Development & Benchmarking', 'Active', NULL),
('A002', 5, 'Dr. Ramesh Kumar', 'Faculty', 'CSE', '2026-09-10', '2026-09-12', 'Guest Lecture on Cloud Computing Architecture', 'Completed', '2026-09-12'),
('A003', 2, 'EDAGOTTI JAGADEESH', 'Student (ECE)', 'ECE', '2026-09-15', '2026-09-25', 'Computer Networks Practical Assignment on VLANs', 'Active', NULL),
('A004', 10, 'NARU JAGADEESH', 'Student (CSE)', 'CSE', '2026-09-01', '2026-09-15', 'Distributed Systems Lab Evaluation', 'Completed', '2026-09-15');

-- Seed Maintenance Records
INSERT INTO maintenance (maintenance_code, equipment_id, issue_description, priority, reported_by, reported_date, resolved_date, cost, status, notes) VALUES
('M001', 3, 'Screen not working / flickering display', 'High', 'Prof. Sunita Rao', '2026-09-10', NULL, 1500.00, 'Under Maintenance', 'Sent to Keysight authorized service center for LCD ribbon cable replacement.'),
('M002', 5, 'Lamp replaced after reaching end of lifecycle', 'Medium', 'Mr. Anand Verma', '2026-09-05', '2026-09-08', 3200.00, 'Resolved', 'New OEM lamp installed and optics recalibrated.'),
('M003', 6, 'No power / SMPS failure', 'High', 'Dr. Ramesh Kumar', '2026-09-01', NULL, 2400.00, 'In Progress', 'Replacement 750W power supply ordered from vendor.'),
('M004', 2, 'Port issue - Gigabit port 8 intermittent connection', 'Medium', 'Mr. Anand Verma', '2026-08-28', '2026-08-30', 0.00, 'Resolved', 'Cleaned oxidized pins and re-crimped patch cable.'),
('M005', 4, 'Paper jam sensor faulty', 'Low', 'Mrs. Lakshmi Devi', '2026-08-20', '2026-08-22', 450.00, 'Resolved', 'Sensor roller cleaned and tested with 100 duplex pages.');
