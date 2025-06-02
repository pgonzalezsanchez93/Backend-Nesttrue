import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './auth/entities/user.entity';
import * as bcryptjs from 'bcryptjs';

export async function initializeApp(userModel: Model<User>) {
  const logger = new Logger('AppInitialization');
  

  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    logger.log('No admin email provided in .env file, skipping admin creation');
    return;
  }
  
  const adminExists = await userModel.findOne({ email: adminEmail });
  
  if (adminExists) {
    logger.log(`Admin user ${adminEmail} already exists, skipping creation`);
    return;
  }
  

  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const adminName = process.env.ADMIN_NAME || 'Administrator';
  
  try {
    const newAdmin = new userModel({
      email: adminEmail,
      name: adminName,
      password: bcryptjs.hashSync(adminPassword, 10),
      isActive: true,
      roles: ['admin', 'user'],
      lastLogin: new Date()
    });
    
    await newAdmin.save();
    logger.log(`Created admin user: ${adminEmail}`);
  } catch (error) {
    logger.error(`Failed to create admin user: ${error.message}`);
  }
}