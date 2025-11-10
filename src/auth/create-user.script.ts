import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

// Script to create a test user
async function createTestUser() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'teddy_db',
    entities: [User],
    synchronize: true,
  });

  await dataSource.initialize();
  
  const userRepository = dataSource.getRepository(User);
  
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = userRepository.create({
    email: 'test@example.com',
    password: hashedPassword,
  });
  
  await userRepository.save(user);
  console.log('Test user created: test@example.com / 123456');
  
  await dataSource.destroy();
}

createTestUser().catch(console.error);