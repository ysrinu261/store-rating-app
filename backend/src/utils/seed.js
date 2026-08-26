require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function main() {
  const email = 'admin@platform.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists, skipping seed.');
    return;
  }

  const hashed = await bcrypt.hash('Admin@1234', 10);
  await prisma.user.create({
    data: {
      name: 'Platform System Administrator', // 20-60 chars per validation rule
      email,
      address: 'Head Office, Platform HQ',
      password: hashed,
      role: 'ADMIN',
    },
  });

  console.log('Default admin created -> email: admin@platform.com | password: Admin@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
