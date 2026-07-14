// scripts/update-db.ts — Alter database schema to add profile and subscription columns
import sequelize, { connectDB } from '../lib/db';

const queries = [
  // Basic Information
  `ALTER TABLE users ADD COLUMN date_of_birth DATE NULL;`,
  `ALTER TABLE users ADD COLUMN marital_status VARCHAR(50) NULL;`,
  `ALTER TABLE users ADD COLUMN mother_tongue VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN community VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN height VARCHAR(50) NULL;`,
  `ALTER TABLE users ADD COLUMN weight VARCHAR(50) NULL;`,
  `ALTER TABLE users ADD COLUMN blood_group VARCHAR(10) NULL;`,
  `ALTER TABLE users ADD COLUMN diet_preference VARCHAR(50) NULL;`,
  `ALTER TABLE users ADD COLUMN smoking_habit VARCHAR(50) NULL;`,
  `ALTER TABLE users ADD COLUMN drinking_habit VARCHAR(50) NULL;`,
  `ALTER TABLE users ADD COLUMN physical_status VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN current_city VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN state VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN country VARCHAR(100) NULL;`,

  // Family Details
  `ALTER TABLE users ADD COLUMN father_name VARCHAR(150) NULL;`,
  `ALTER TABLE users ADD COLUMN father_occupation VARCHAR(150) NULL;`,
  `ALTER TABLE users ADD COLUMN mother_name VARCHAR(150) NULL;`,
  `ALTER TABLE users ADD COLUMN mother_occupation VARCHAR(150) NULL;`,
  `ALTER TABLE users ADD COLUMN brothers_count INT DEFAULT 0 NULL;`,
  `ALTER TABLE users ADD COLUMN brothers_status VARCHAR(255) NULL;`,
  `ALTER TABLE users ADD COLUMN sisters_count INT DEFAULT 0 NULL;`,
  `ALTER TABLE users ADD COLUMN sisters_status VARCHAR(255) NULL;`,
  `ALTER TABLE users ADD COLUMN family_type VARCHAR(50) NULL;`,
  `ALTER TABLE users ADD COLUMN family_values VARCHAR(50) NULL;`,
  `ALTER TABLE users ADD COLUMN family_financial_status VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN family_native_place VARCHAR(150) NULL;`,

  // Education & Career
  `ALTER TABLE users ADD COLUMN highest_qualification VARCHAR(150) NULL;`,
  `ALTER TABLE users ADD COLUMN college_university VARCHAR(150) NULL;`,
  `ALTER TABLE users ADD COLUMN field_of_study VARCHAR(150) NULL;`,
  `ALTER TABLE users ADD COLUMN company_name VARCHAR(150) NULL;`,
  `ALTER TABLE users ADD COLUMN job_designation VARCHAR(150) NULL;`,
  `ALTER TABLE users ADD COLUMN employment_type VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN annual_income VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN work_location VARCHAR(150) NULL;`,
  `ALTER TABLE users ADD COLUMN years_of_experience INT NULL;`,

  // Hobbies & Interests
  `ALTER TABLE users ADD COLUMN hobbies TEXT NULL;`,

  // Partner Preferences
  `ALTER TABLE users ADD COLUMN partner_age_min INT NULL;`,
  `ALTER TABLE users ADD COLUMN partner_age_max INT NULL;`,
  `ALTER TABLE users ADD COLUMN partner_height_min VARCHAR(50) NULL;`,
  `ALTER TABLE users ADD COLUMN partner_height_max VARCHAR(50) NULL;`,
  `ALTER TABLE users ADD COLUMN partner_marital_status VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN partner_religion VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN partner_caste VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN partner_education VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN partner_occupation VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN partner_income VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN partner_location VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN partner_diet VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN partner_smoking VARCHAR(100) NULL;`,
  `ALTER TABLE users ADD COLUMN partner_drinking VARCHAR(100) NULL;`,

  // Privacy & Security
  `ALTER TABLE users ADD COLUMN privacy_settings TEXT NULL;`,

  // Subscription Table Details
  `ALTER TABLE subscriptions ADD COLUMN payment_date DATETIME NULL;`,
  `ALTER TABLE subscriptions ADD COLUMN transaction_id VARCHAR(100) NULL;`
];

async function main() {
  try {
    await connectDB();
    console.log('🔄 Applying schema migrations to matrimonial database...');

    for (const query of queries) {
      try {
        await sequelize.query(query);
      } catch (err: any) {
        // Ignore duplicate column errors (Error code: ER_DUP_FIELDNAME or SQL State: 42S21 / Error number: 1060)
        if (err.parent?.errno === 1060 || err.message?.includes('Duplicate column')) {
          // Column already exists, safe to ignore
        } else {
          console.warn(`⚠️ Warning executing query: "${query.substring(0, 50)}..."\n  Error: ${err.message}`);
        }
      }
    }

    console.log('✅ Schema migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  }
}

main();
