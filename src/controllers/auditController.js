/**
 * Audit Controller
 * Handles audit trail retrieval and reporting
 */

const AuditLog = require('../models/AuditLog');
const { PAGINATION } = require('../config/constants');

const normalizeActionList = (rawAction, rawActions) => {
  const values = [];

  const append = (value) => {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach(append);
      return;
    }

    if (typeof value === 'string') {
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => values.push(item));
    }
  };

  append(rawActions);
  if (!rawActions) append(rawAction);

  return [...new Set(values)];
};

/**
 * Get all audit logs with filtering and pagination
 */
const getAuditLogs = async (req, res) => {
  try {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, userId, action, actions, startDate, endDate } = req.query;
    const actionList = normalizeActionList(action, actions);

    // Build filter
    const filter = {};
    if (userId) filter.userId = userId;
    if (actionList.length === 1) {
      filter.action = actionList[0];
    } else if (actionList.length > 1) {
      filter.action = { $in: actionList };
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    // Fetch logs
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'fullName email role');

    // Get total count
    const total = await AuditLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully!',
      data: logs,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving audit logs: ' + error.message,
    });
  }
};

/**
 * Get audit logs for a specific entity
 */
const getEntityAuditTrail = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const logs = await AuditLog.find({ entityType, entityId })
      .sort({ timestamp: -1 })
      .populate('userId', 'fullName email role');

    res.status(200).json({
      success: true,
      message: 'Entity audit trail retrieved successfully!',
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving entity audit trail: ' + error.message,
    });
  }
};

/**
 * Get audit statistics
 */
const getAuditStatistics = async (req, res) => {
  try {
    const { days = 30, action, actions } = req.query;
    const actionList = normalizeActionList(action, actions);

    const dayCount = Math.max(1, parseInt(days, 10) || 30);
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (dayCount - 1));

    const matchFilter = {
      timestamp: { $gte: startDate },
    };

    if (actionList.length === 1) {
      matchFilter.action = actionList[0];
    } else if (actionList.length > 1) {
      matchFilter.action = { $in: actionList };
    }

    // Count actions by type
    const actionStats = await AuditLog.aggregate([
      {
        $match: matchFilter,
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Count actions by user
    const userStats = await AuditLog.aggregate([
      {
        $match: matchFilter,
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
    ]);

    // Count actions by day for trend visualizations.
    const rawDailyStats = await AuditLog.aggregate([
      {
        $match: matchFilter,
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const dailyCountMap = new Map(rawDailyStats.map((item) => [item._id, item.count]));
    const dailyStats = [];
    const cursorDate = new Date(startDate);
    const endDate = new Date();

    while (cursorDate <= endDate) {
      const key = cursorDate.toISOString().split('T')[0];
      dailyStats.push({
        _id: key,
        count: dailyCountMap.get(key) || 0,
      });
      cursorDate.setDate(cursorDate.getDate() + 1);
    }

    let dailyActionStats = [];

    if (actionList.length > 1) {
      const rawDailyActionStats = await AuditLog.aggregate([
        {
          $match: matchFilter,
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$timestamp',
                },
              },
              action: '$action',
            },
            count: { $sum: 1 },
          },
        },
      ]);

      const actionDateMap = new Map();
      rawDailyActionStats.forEach((item) => {
        const actionName = item._id.action;
        const dateKey = item._id.date;
        if (!actionDateMap.has(actionName)) {
          actionDateMap.set(actionName, new Map());
        }
        actionDateMap.get(actionName).set(dateKey, item.count);
      });

      dailyActionStats = actionList.map((actionName) => ({
        action: actionName,
        data: dailyStats.map((point) => ({
          _id: point._id,
          count: actionDateMap.get(actionName)?.get(point._id) || 0,
        })),
      }));
    }

    res.status(200).json({
      success: true,
      message: 'Audit statistics retrieved successfully!',
      data: {
        actionStats,
        userStats,
        dailyStats,
        dailyActionStats,
        period: `Last ${dayCount} days`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving audit statistics: ' + error.message,
    });
  }
};

module.exports = {
  getAuditLogs,
  getEntityAuditTrail,
  getAuditStatistics,
};
