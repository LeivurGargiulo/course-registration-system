import { AuthService } from './auth';
import { storage } from './storage';

async function seedUsers() {
  console.log('Seeding users...');

  try {
    // Create admin user
    const adminUser = await AuthService.createUser({
      username: 'admin',
      email: 'admin@devcourses.com',
      password: 'admin123',
      role: 'admin',
    });
    
    console.log('Created admin user:', { id: adminUser.id, username: adminUser.username, role: adminUser.role });

    // Create regular user
    const regularUser = await AuthService.createUser({
      username: 'usuario',
      email: 'usuario@example.com', 
      password: 'user123',
      role: 'user',
    });

    console.log('Created regular user:', { id: regularUser.id, username: regularUser.username, role: regularUser.role });

    console.log('\n=== Login Credentials ===');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('\nRegular User:');
    console.log('  Username: usuario');
    console.log('  Password: user123');
    console.log('=========================\n');

  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsers();
}

export { seedUsers };