import prisma from '../src/utils/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  // Define your admin credentials
  const adminEmail = 'admin@nkathawellness.com';
  const plainPassword = 'SecurePassword123!'; // Change this to your preferred password

  // Hash the password securely using bcrypt
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Upsert ensures we don't create duplicates if run multiple times
  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
        name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log('🌱 Starting database seeding...');
  await prisma.appointment.deleteMany();

  // Clear existing services to avoid duplicates on re-seeds (Optional)
  await prisma.service.deleteMany();

  const services = [
    {
      name: 'Individual Therapy',
      description: 'A one-on-one, confidential space dedicated entirely to you. We will work collaboratively to untangle complex emotions, heal past traumas, and develop healthy coping mechanisms.',
      durationMinutes: 60,
      price: 50.00,
      focusAreas: ['Anxiety & Stress', 'Depression', 'Life Transitions', 'Self-Esteem']
    },
    {
      name: 'Couples Counseling',
      description: 'Relationships require maintenance. Whether navigating a specific crisis or feeling disconnected, we provide a neutral ground to improve communication and rebuild intimacy.',
      durationMinutes: 75,
      price: 75.00,
      focusAreas: ['Communication Issues', 'Conflict Resolution', 'Premarital Counseling', 'Rebuilding Trust']
    },
    {
      name: 'Teen & Adolescent Therapy',
      description: 'The teenage years are complex. We offer a safe, relatable environment for young adults to process peer pressure, academic stress, and identity formation without judgment.',
      durationMinutes: 60,
      price: 45.00,
      focusAreas: ['Academic Anxiety', 'Peer Relationships', 'Emotional Regulation', 'Identity & Self-Worth']
    },
    {
      name: 'Career & Life Coaching',
      description: 'Sometimes the barrier isn\'t clinical, it\'s directional. This service focuses on actionable goal-setting, overcoming professional burnout, and finding purpose in your daily life.',
      durationMinutes: 60,
      price: 60.00,
      focusAreas: ['Career Transitions', 'Burnout Recovery', 'Work-Life Balance', 'Goal Setting']
    }
  ];

  for (const service of services) {
    await prisma.service.create({
      data: service
    });
  }

  console.log('----------------------------------------');
  console.log('✅ Admin user seeded successfully!');
  console.log(`Email:    ${admin.email}`);
  console.log(`Password: ${plainPassword}`);
  console.log('----------------------------------------');
    console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding admin user:', e);
    process.exit(1);
  }).finally (async () => {
    await prisma.$disconnect();
  });