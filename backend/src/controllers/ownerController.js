const prisma = require('../config/prisma');

// GET /api/owner/dashboard — assigned store metrics + rater list
const getDashboard = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const store = await prisma.store.findUnique({
      where: { ownerId },
      include: {
        ratings: {
          include: { user: { select: { id: true, name: true, email: true, address: true } } },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ message: 'No store is assigned to this account yet.' });
    }

    const total = store.ratings.length;
    const averageRating = total > 0 ? (store.ratings.reduce((acc, r) => acc + r.value, 0) / total).toFixed(1) : 'No ratings yet';

    res.json({
      store: { id: store.id, name: store.name, email: store.email, address: store.address },
      averageRating,
      totalRatings: total,
      raters: store.ratings.map((r) => ({
        ratingId: r.id,
        value: r.value,
        submittedAt: r.updatedAt,
        user: r.user,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch owner dashboard', error: error.message });
  }
};

module.exports = { getDashboard };
