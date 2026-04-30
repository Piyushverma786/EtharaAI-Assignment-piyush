const express = require("express");
const { Op } = require("sequelize");
const { Project, ProjectMember, User } = require("../models");
const { requireRole } = require("../middleware/rbac");

const router = express.Router();

async function getUserProjectIds(userId) {
  const memberships = await ProjectMember.findAll({
    where: { userId },
    attributes: ["projectId"],
  });
  return memberships.map((entry) => entry.projectId);
}

async function ensureProjectMembership(projectId, userId) {
  return ProjectMember.findOne({ where: { projectId, userId } });
}

router.post("/", requireRole("admin"), async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const description = String(req.body?.description || "").trim() || null;
    if (!name) return res.status(400).json({ message: "Project name is required." });

    const project = await Project.create({
      name,
      description,
      ownerId: req.user.id,
    });

    await ProjectMember.create({
      projectId: project.id,
      userId: req.user.id,
      projectRole: "admin",
    });

    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create project", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const memberProjectIds = await getUserProjectIds(req.user.id);

    const projects = await Project.findAll({
      where: {
        [Op.or]: [{ ownerId: req.user.id }, { id: memberProjectIds }],
      },
      include: [{ model: User, as: "owner", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
});

router.post("/:projectId/members", requireRole("admin"), async (req, res) => {
  try {
    const { projectId } = req.params;
    const email = String(req.body?.email || "").trim().toLowerCase();
    const projectRole = req.body?.projectRole;

    if (!email) {
      return res.status(400).json({ message: "Member email is required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found by email" });

    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const existing = await ProjectMember.findOne({ where: { projectId, userId: user.id } });
    if (existing) return res.status(409).json({ message: "User already in project" });

    const member = await ProjectMember.create({
      projectId,
      userId: user.id,
      projectRole: projectRole === "admin" ? "admin" : "member",
    });

    return res.status(201).json(member);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add member", error: error.message });
  }
});

router.get("/:projectId/members", async (req, res) => {
  try {
    const { projectId } = req.params;
    const isMember = await ensureProjectMembership(projectId, req.user.id);
    if (!isMember) return res.status(403).json({ message: "Not a member of this project" });

    const members = await ProjectMember.findAll({
      where: { projectId },
      include: [{ model: User, attributes: ["id", "name", "email", "role"] }],
      order: [["createdAt", "ASC"]],
    });

    return res.json(members);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch members", error: error.message });
  }
});

module.exports = router;
