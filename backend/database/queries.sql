-- ==========================================================
-- College Laboratory Equipment Management System (Lab EMS)
-- Comprehensive SQL Queries Demonstration
-- (JOIN, UPDATE, DELETE, COUNT, GROUP BY)
-- ==========================================================

USE lab_ems_db;

-- ----------------------------------------------------------
-- 1. JOIN QUERIES
-- ----------------------------------------------------------

-- 1.1 Multi-table INNER JOIN: Retrieve Equipment with Category and Laboratory Details
SELECT 
    e.equipment_id,
    e.equipment_code,
    e.name AS equipment_name,
    c.category_name,
    l.lab_name,
    l.location,
    l.in_charge,
    e.status,
    e.purchase_date,
    e.warranty,
    e.model_number,
    e.serial_number,
    e.description
FROM equipment e
INNER JOIN categories c ON e.category_id = c.category_id
INNER JOIN laboratories l ON e.lab_id = l.lab_id
ORDER BY e.equipment_code ASC;

-- 1.2 LEFT JOIN: Retrieve Maintenance Records with Equipment, Category, and Lab Information
SELECT 
    m.maintenance_id,
    m.maintenance_code,
    e.equipment_code,
    e.name AS equipment_name,
    c.category_name,
    l.lab_name,
    m.issue_description,
    m.priority,
    m.reported_by,
    m.reported_date,
    m.resolved_date,
    m.cost,
    m.status AS maintenance_status,
    m.notes
FROM maintenance m
INNER JOIN equipment e ON m.equipment_id = e.equipment_id
LEFT JOIN categories c ON e.category_id = c.category_id
LEFT JOIN laboratories l ON e.lab_id = l.lab_id
ORDER BY m.reported_date DESC;

-- 1.3 INNER JOIN: Retrieve Active & Historical Allocations
SELECT 
    a.allocation_id,
    a.allocation_code,
    e.equipment_code,
    e.name AS equipment_name,
    c.category_name,
    l.lab_name,
    a.allocated_to_name,
    a.allocated_to_role,
    a.department,
    a.from_date,
    a.to_date,
    a.purpose,
    a.status AS allocation_status,
    a.returned_date
FROM allocations a
INNER JOIN equipment e ON a.equipment_id = e.equipment_id
INNER JOIN categories c ON e.category_id = c.category_id
INNER JOIN laboratories l ON e.lab_id = l.lab_id
ORDER BY a.allocation_id DESC;

-- ----------------------------------------------------------
-- 2. GROUP BY & COUNT QUERIES (Reports & Dashboard KPIs)
-- ----------------------------------------------------------

-- 2.1 Equipment Breakdown by Laboratory (Mockup Screen 9: By Laboratory Report)
SELECT 
    l.lab_name AS laboratory,
    COUNT(e.equipment_id) AS total_equipment,
    SUM(CASE WHEN e.status = 'Available' THEN 1 ELSE 0 END) AS available,
    SUM(CASE WHEN e.status = 'In Use' THEN 1 ELSE 0 END) AS in_use,
    SUM(CASE WHEN e.status = 'Under Maintenance' THEN 1 ELSE 0 END) AS under_maintenance,
    SUM(CASE WHEN e.status = 'Damaged' THEN 1 ELSE 0 END) AS damaged
FROM laboratories l
LEFT JOIN equipment e ON l.lab_id = e.lab_id
GROUP BY l.lab_id, l.lab_name
ORDER BY total_equipment DESC;

-- 2.2 Equipment Breakdown by Category (Mockup Screen 2 & 9: By Category Report)
SELECT 
    c.category_name AS category,
    COUNT(e.equipment_id) AS total_equipment,
    SUM(CASE WHEN e.status = 'Available' THEN 1 ELSE 0 END) AS available,
    SUM(CASE WHEN e.status = 'In Use' THEN 1 ELSE 0 END) AS in_use,
    SUM(CASE WHEN e.status = 'Under Maintenance' THEN 1 ELSE 0 END) AS under_maintenance,
    SUM(CASE WHEN e.status = 'Damaged' THEN 1 ELSE 0 END) AS damaged
FROM categories c
LEFT JOIN equipment e ON c.category_id = e.category_id
GROUP BY c.category_id, c.category_name
ORDER BY total_equipment DESC;

-- 2.3 Maintenance Summary by Status (Mockup Screen 2: Bar Chart Report)
SELECT 
    status AS maintenance_status,
    COUNT(*) AS total_count,
    COALESCE(SUM(cost), 0.00) AS total_cost
FROM maintenance
GROUP BY status;

-- 2.4 Overall Dashboard Status KPI Counts
SELECT 
    COUNT(*) AS total_equipment,
    SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available_count,
    SUM(CASE WHEN status = 'In Use' THEN 1 ELSE 0 END) AS in_use_count,
    SUM(CASE WHEN status = 'Under Maintenance' THEN 1 ELSE 0 END) AS maintenance_count,
    SUM(CASE WHEN status = 'Damaged' THEN 1 ELSE 0 END) AS damaged_count
FROM equipment;

-- ----------------------------------------------------------
-- 3. UPDATE QUERIES
-- ----------------------------------------------------------

-- 3.1 Update Equipment Details
UPDATE equipment 
SET 
    name = 'Dell OptiPlex 7090 Tower',
    category_id = 1,
    lab_id = 1,
    status = 'Available',
    purchase_date = '2024-08-12',
    warranty = '3 Years',
    description = 'Upgraded with 16GB RAM and NVMe SSD'
WHERE equipment_id = 1;

-- 3.2 Update Equipment Status to Under Maintenance upon Damage Report
UPDATE equipment 
SET status = 'Under Maintenance' 
WHERE equipment_id = 5;

-- 3.3 Update Maintenance Ticket Status and Resolution Notes
UPDATE maintenance 
SET 
    status = 'Resolved',
    resolved_date = CURRENT_DATE,
    cost = 1200.00,
    notes = 'Component replaced and recalibrated successfully.'
WHERE maintenance_id = 1;

-- 3.4 Update Allocation to Completed and Mark Equipment Available
UPDATE allocations 
SET 
    status = 'Completed',
    returned_date = CURRENT_DATE 
WHERE allocation_id = 1;

UPDATE equipment 
SET status = 'Available' 
WHERE equipment_id = 1;

-- ----------------------------------------------------------
-- 4. DELETE QUERIES
-- ----------------------------------------------------------

-- 4.1 Delete Allocation Record by ID
DELETE FROM allocations 
WHERE allocation_id = 4;

-- 4.2 Delete Maintenance Record by ID
DELETE FROM maintenance 
WHERE maintenance_id = 5;

-- 4.3 Delete Equipment Record (Cascades or safely removes)
DELETE FROM equipment 
WHERE equipment_id = 10;
