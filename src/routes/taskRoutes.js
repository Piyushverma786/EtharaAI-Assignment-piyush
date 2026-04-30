const express = require("express");
const { Task, Project, ProjectMember, User } = require("../models");

const router = express.Router();

router.post("/projects/:projectId/tasks", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, dueDate } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({ message: "Title and assignedTo are required" });
    }

    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const creatorMembership = await ProjectMember.findOne({
      where: { projectId, userId: req.user.id },
    });
    if (!creatorMembership) {
      return res.status(403).json({ message: "You are not part of this project" });
    }

    if (req.user.role !== "admin" && creatorMembership.projectRole !== "admin") {
      return res.status(403).json({ message: "Only admin/project admin can create tasks" });
    }

    const assigneeMembership = await ProjectMember.findOne({
      where: { projectId, userId: assignedTo },
    });
    if (!assigneeMembership) {
      return res.status(400).json({ message: "Assignee must be part of this project" });
    }

    const task = await Task.create({
      title,
      description: description || null,
      projectId,
      assignedTo,
      createdBy: req.user.id,
      dueDate: dueDate || null,
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create task", error: error.message });
  }
});

router.get("/projects/:projectId/tasks", async (req, res) => {
  try {
    const { projectId } = req.params;
    const membership = await ProjectMember.findOne({ where: { projectId, userId: req.user.id } });
    if (!membership) return res.status(403).json({ message: "Not a project member" });

    const tasks = await Task.findAll({
      where: { projectId },
      include: [
        { model: User, as: "assignee", attributes: ["id", "name", "email"] },
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
});

router.patch("/tasks/:taskId/status", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    if (!["todo", "in_progress", "done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const membership = await ProjectMember.findOne({
      where: { projectId: task.projectId, userId: req.user.id },
    });
    if (!membership) return res.status(403).json({ message: "Not a project member" });

    if (req.user.role !== "admin" && task.assignedTo !== req.user.id) {
      return res.status(403).json({ message: "Only assignee/admin can change status" });
    }

    task.status = status;
    await task.save();
    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update status", error: error.message });
  }
});

module.exports = router;
