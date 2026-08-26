const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const SALT_ROUNDS = 10;

// GET /api/admin/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};

// POST /api/admin/users — create a NORMAL_USER or ADMIN
const createUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;
    const finalRole = role === 'ADMIN' ? 'ADMIN' : 'NORMAL_USER'; // store owners are created via /admin/stores

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'A user with this email already exists.' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name, email, address, password: hashed, role: finalRole },
    });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

// POST /api/admin/stores — create a store together with its owner account
const createStore = async (req, res) => {
  try {
    const { storeName, storeEmail, storeAddress, ownerName, ownerEmail, ownerAddress, ownerPassword } = req.body;

    const [existingOwnerEmail, existingStoreEmail] = await Promise.all([
      prisma.user.findUnique({ where: { email: ownerEmail } }),
      prisma.store.findUnique({ where: { email: storeEmail } }),
    ]);
    if (existingOwnerEmail) return res.status(409).json({ message: 'A user with the owner email already exists.' });
    if (existingStoreEmail) return res.status(409).json({ message: 'A store with this email already exists.' });

    const hashed = await bcrypt.hash(ownerPassword, SALT_ROUNDS);

    const store = await prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          address: ownerAddress,
          password: hashed,
          role: 'STORE_OWNER',
        },
      });

      return tx.store.create({
        data: {
          name: storeName,
          email: storeEmail,
          address: storeAddress,
          ownerId: owner.id,
        },
        include: { owner: true },
      });
    });

    res.status(201).json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: { id: store.owner.id, name: store.owner.name, email: store.owner.email },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create store', error: error.message });
  }
};

// GET /api/admin/users?search=&role=&sortBy=&order=
const getUsers = async (req, res) => {
  try {
    const { search, role, sortBy = 'name', order = 'asc' } = req.query;

    const allowedSort = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const where = {
      AND: [
        role ? { role } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      include: { store: { include: { ratings: true } } },
    });

    const formatted = users.map((u) => {
      let ownedStoreRating = null;
      if (u.role === 'STORE_OWNER' && u.store) {
        const total = u.store.ratings.length;
        ownedStoreRating =
          total > 0 ? (u.store.ratings.reduce((acc, r) => acc + r.value, 0) / total).toFixed(1) : 'No ratings yet';
      }
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        rating: ownedStoreRating, // only populated for store owners
        createdAt: u.createdAt,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// GET /api/admin/users/:id — full detail view
const getUserDetail = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { store: { include: { ratings: true } } },
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    let ownedStoreRating = null;
    if (user.role === 'STORE_OWNER' && user.store) {
      const total = user.store.ratings.length;
      ownedStoreRating =
        total > 0 ? (user.store.ratings.reduce((acc, r) => acc + r.value, 0) / total).toFixed(1) : 'No ratings yet';
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      rating: ownedStoreRating,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

// GET /api/admin/stores?search=&sortBy=&order=
const getStores = async (req, res) => {
  try {
    const { search, sortBy = 'name', order = 'asc' } = req.query;
    const allowedSort = ['name', 'email', 'address', 'createdAt'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const stores = await prisma.store.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { [sortField]: sortOrder },
      include: { ratings: true, owner: true },
    });

    const formatted = stores.map((s) => {
      const total = s.ratings.length;
      const avg = total > 0 ? (s.ratings.reduce((acc, r) => acc + r.value, 0) / total).toFixed(1) : 'No ratings yet';
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        rating: avg,
        ownerName: s.owner.name,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stores', error: error.message });
  }
};

module.exports = { getDashboardStats, createUser, createStore, getUsers, getUserDetail, getStores };
