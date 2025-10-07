const mongoose = require('mongoose');
const Admin = require("../models/admin")
require('dotenv').config();

/**
 * Create default super admin account
 */
const createDefaultAdmin = async () => {
  try {
    // Check if any super-admin exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super-admin' });
    
    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists');
      return;
    }
    
    // Create default super admin
    const defaultAdmin = new Admin({
      username: 'superadmin',
      email: 'admin@company.com',
      password: 'admin123456', // Change this in production!
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super-admin',
      permissions: [
        'manage-services',
        'manage-projects',
        'manage-team',
        'manage-gallery',
        'manage-careers',
        'manage-contacts',
        'manage-admins',
        'view-analytics'
      ]
    });
    
    await defaultAdmin.save();
    
    console.log('✅ Default super admin created successfully');
    console.log('📧 Email: admin@company.com');
    console.log('👤 Username: superadmin');
    console.log('🔑 Password: admin123456');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

/**
 * Seed admin data
 */
const seedAdmins = async () => {
  try {
    await createDefaultAdmin();
    
    // You can add more default admins here if needed
    // const editorAdmin = new Admin({...});
    
  } catch (error) {
    console.error('❌ Error seeding admin data:', error.message);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/company_portfolio')
    .then(async () => {
      console.log('📦 Connected to MongoDB for seeding');
      await seedAdmins();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    });
}

module.exports = { seedAdmins, createDefaultAdmin };