const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// @route GET /api/notifications
// @desc Get all notifications for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
});

// @route PUT /api/notifications/:id/read
// @desc Mark a notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    await notification.update({ read: true });
    res.json({ message: 'Notification marked as read.', notification });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error updating notification.' });
  }
});

// @route PUT /api/notifications/read-all
// @desc Mark all notifications as read for current user
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { userId: req.user.id, read: false } }
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Read-all notifications error:', error);
    res.status(500).json({ message: 'Server error updating notifications.' });
  }
});

module.exports = router;
