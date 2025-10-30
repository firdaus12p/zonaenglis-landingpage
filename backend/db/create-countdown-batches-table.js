import db from "./connection.js";

const createCountdownBatchesTable = async () => {
  try {
    console.log("Dropping existing countdown_batches table if exists...");

    await db.query("DROP TABLE IF EXISTS countdown_batches");
    console.log("✅ Old table dropped");

    console.log("Creating new countdown_batches table...");

    const createTableSQL = `
      CREATE TABLE countdown_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_date DATE,
        end_time TIME,
        timezone VARCHAR(10) DEFAULT 'WITA',
        description TEXT,
        instructor VARCHAR(255),
        location_mode ENUM('Online', 'Offline', 'Hybrid') DEFAULT 'Online',
        location_address VARCHAR(500),
        price DECIMAL(10, 2) DEFAULT 0,
        registration_deadline DATE,
        target_students INT DEFAULT 0,
        current_students INT DEFAULT 0,
        status ENUM('Active', 'Paused', 'Completed', 'Upcoming') DEFAULT 'Upcoming',
        visibility ENUM('Public', 'Private') DEFAULT 'Public',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_start_date (start_date),
        INDEX idx_visibility (visibility),
        INDEX idx_location_mode (location_mode)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await db.query(createTableSQL);
    console.log("✅ Table countdown_batches created successfully");

    // Insert sample data
    console.log("Inserting sample countdown batches...");

    const insertSampleData = `
      INSERT INTO countdown_batches 
        (name, start_date, start_time, end_date, end_time, timezone, description, 
         instructor, location_mode, location_address, price, registration_deadline,
         target_students, current_students, status, visibility)
      VALUES
        (
          'Batch A - Intensive English',
          '2025-11-03',
          '09:00:00',
          '2025-12-03',
          '12:00:00',
          'WITA',
          'Program intensif pembelajaran bahasa Inggris dengan metode NBSN dan AI Coach',
          'Dr. Sarah Johnson',
          'Hybrid',
          'Jl. Pendidikan No. 123, Makassar',
          2500000,
          '2025-10-31',
          50,
          32,
          'Active',
          'Public'
        ),
        (
          'Batch B - Advanced Course',
          '2025-12-01',
          '14:00:00',
          '2026-01-15',
          '17:00:00',
          'WITA',
          'Program lanjutan untuk peserta yang telah menyelesaikan Batch A',
          'Prof. Michael Chen',
          'Online',
          'Zoom Meeting',
          1800000,
          '2025-11-25',
          40,
          15,
          'Upcoming',
          'Public'
        ),
        (
          'Batch Premium - Private Class',
          '2025-01-15',
          '10:30:00',
          '2025-03-15',
          '13:30:00',
          'WITA',
          'Program eksklusif dengan mentor personal dan kelas privat',
          'Ms. Emma Williams',
          'Offline',
          'Premium Learning Center, Makassar',
          5000000,
          '2025-01-10',
          20,
          8,
          'Upcoming',
          'Private'
        )
      ON DUPLICATE KEY UPDATE name = name;
    `;

    await db.query(insertSampleData);
    console.log("✅ Sample countdown batches inserted successfully");

    console.log("\n🎉 Setup complete!");
    console.log("You can now use the countdown batches API");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating countdown_batches table:", error);
    process.exit(1);
  }
};

createCountdownBatchesTable();
