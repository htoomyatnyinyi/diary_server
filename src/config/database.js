import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// MySQL connection pool configuration
const pool = mysql
  .createPool({
    host: process.env.DB_HOST || "localhost", // Replace with your MySQL host
    user: process.env.DB_USER || "root", // Replace with your MySQL username
    password: process.env.DB_PASSWORD || "hmnn", // Replace with your MySQL password
    database: process.env.DB_NAME || "nobel", // Replace with your database name
    port: process.env.DB_PORT || 3306,
    waitForConnections: true, // Ensure pool waits for connections
    connectionLimit: 10, // Limit concurrent connections // Max connections in pool
    queueLimit: 0, // Unlimited queue for waiting connections
  })
  .promise();

// Function to initialize the database (create tables if they don't exist)
async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // 1. Users Table
    await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'employer', 'admin') NOT NULL,
                is_verified BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                failed_login_attempts INT DEFAULT 0,
                locked_until TIMESTAMP NULL,
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

    // 2. Job Seeker Profiles
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS job_seeker_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                gender ENUM('male', 'female', 'other', 'prefer_not_to_say') DEFAULT 'prefer_not_to_say',
                date_of_birth DATE,
                location VARCHAR(255),
                bio VARCHAR(5000),
                profile_image_url VARCHAR(255),
                cover_image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

    // 3. Employer Profiles
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS employer_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                company_name VARCHAR(255) NOT NULL,
                registered_number VARCHAR(10) NULL,
                contact_phone VARCHAR(20) NOT NULL,
                address_line VARCHAR(255),
                city VARCHAR(100),
                state VARCHAR(100),
                postal_code VARCHAR(20),
                country VARCHAR(100),
                website_url VARCHAR(255),
                industry VARCHAR(100),
                company_description VARCHAR(5000),
                logo_url VARCHAR(255),
                status ENUM('active', 'inactive', 'pending', 'suspended') DEFAULT 'pending',
                subscription_plan ENUM('free', 'basic', 'premium') DEFAULT 'free',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

    // 4. Job Posts
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS job_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employer_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description VARCHAR(10000) NOT NULL,
                salary_min DECIMAL(15,2),
                salary_max DECIMAL(15,2),
                location VARCHAR(255),
                address VARCHAR(255),
                employment_type ENUM('full_time', 'part_time', 'contract', 'internship', 'apprenticeship') NOT NULL,
                category VARCHAR(100),
                post_image_url VARCHAR(255),
                company_logo VARCHAR(255),
                application_deadline DATE,
                is_active BOOLEAN DEFAULT TRUE,
                posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
                CHECK (salary_min <= salary_max),
                INDEX idx_title (title),
                INDEX idx_location (location),
                INDEX idx_category (category)
            )
        `);

    // 5. Job Responsibilities
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS job_responsibilities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                job_post_id INT NOT NULL,
                responsibility VARCHAR(1000) NOT NULL,
                display_order INT DEFAULT 0,
                FOREIGN KEY (job_post_id) REFERENCES job_posts(id) ON DELETE CASCADE
            )
        `);

    // 6. Job Requirements
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS job_requirements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                job_post_id INT NOT NULL,
                requirement VARCHAR(1000) NOT NULL,
                display_order INT DEFAULT 0,
                FOREIGN KEY (job_post_id) REFERENCES job_posts(id) ON DELETE CASCADE
            )
        `);

    // 7. Resumes
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS resumes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_type VARCHAR(50) NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

    // 8. Job Applications
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS job_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                job_post_id INT NOT NULL,
                resume_id INT,
                status ENUM('pending', 'reviewed', 'interviewed', 'offered', 'rejected', 'withdrawn') DEFAULT 'pending',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (job_post_id) REFERENCES job_posts(id) ON DELETE CASCADE,
                FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL,
                UNIQUE (user_id, job_post_id)
            )
        `);

    // 9. Saved Jobs
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS saved_jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                job_post_id INT NOT NULL,
                saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (job_post_id) REFERENCES job_posts(id) ON DELETE CASCADE,
                UNIQUE (user_id, job_post_id)
            )
        `);

    // 10. Job Seeker Skills
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS job_seeker_skills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                skill_name VARCHAR(100) NOT NULL,
                proficiency ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_skill_name (skill_name)
            )
        `);

    // 11. Job Post Skills
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS job_post_skills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                job_post_id INT NOT NULL,
                skill_name VARCHAR(100) NOT NULL,
                required_proficiency ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
                FOREIGN KEY (job_post_id) REFERENCES job_posts(id) ON DELETE CASCADE,
                INDEX idx_skill_name (skill_name)
            )
        `);

    console.log("Database initialization complete.");
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Test the connection and initialize the database
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL database successfully!");
    connection.release();
    await initializeDatabase(); // Create tables after connection is verified
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

// Export the pool for use in other parts of the app
export { initializeDatabase, testConnection };
export default pool;
