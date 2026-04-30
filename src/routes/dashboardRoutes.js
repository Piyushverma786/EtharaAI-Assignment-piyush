const express = require("express");
const { Op } = require("sequelize");
const { Task } = require("../models");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const assignedTasks = await Task.findAll({ where: { assignedTo: req.user.id } });

    const summary = {
      totalAssigned: assignedTasks.length,
      todo: assignedTasks.filter((t) => t.status === "todo").length,
      inProgress: assignedTasks.filter((t) => t.status === "in_progress").length,
      done: assignedTasks.filter((t) => t.status === "done").length,
      overdue: assignedTasks.filter((t) => t.dueDate && t.dueDate < now && t.status !== "done").length,
    };

    const overdueTasks = await Task.findAll({
      where: {
        assignedTo: req.user.id,
        dueDate: { [Op.lt]: now },
        status: { [Op.ne]: "done" },
      },
      order: [["dueDate", "ASC"]],
    });

    return res.json({ summary, overdueTasks });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard", error: error.message });
  }
});

module.exports = router;
