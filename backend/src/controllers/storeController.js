const prisma = require('../config/prisma');

// GET /api/stores?search=&sortBy=&order= — normal user store listing
const getStoresForUser = async (req, res) => {
  try {
    const { search, sortBy = 'name', order = 'asc' } = req.query;
    const userId = req.user.userId;

    const allowedSort = ['name', 'address'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const stores = await prisma.store.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { [sortField]: sortOrder },
      include: { ratings: true },
    });

    const formatted = stores.map((store) => {
      const total = store.ratings.length;
      const avgRating = total > 0 ? (store.ratings.reduce((acc, r) => acc + r.value, 0) / total).toFixed(1) : 'No ratings yet';
      const userRating = store.ratings.find((r) => r.userId === userId)?.value ?? null;

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        overallRating: avgRating,
        userSubmittedRating: userRating,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve stores', error: error.message });
  }
};

// POST /api/stores/:storeId/rate — submit or modify a rating (upsert)
const submitRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { value } = req.body;
    const userId = req.user.userId;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const rating = await prisma.rating.upsert({
      where: { userId_storeId: { userId, storeId } },
      update: { value },
      create: { userId, storeId, value },
    });

    res.status(200).json({ message: 'Rating saved.', rating });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit rating', error: error.message });
  }
};

module.exports = { getStoresForUser, submitRating };
