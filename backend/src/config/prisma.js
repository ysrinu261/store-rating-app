const { PrismaClient } = require('@prisma/client');

// Reuse a single PrismaClient instance across the app (avoids exhausting
// DB connections during dev with nodemon hot reloads).
const prisma = new PrismaClient();

module.exports = prisma;
