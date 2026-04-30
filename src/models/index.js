const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "member"),
      allowNull: false,
      defaultValue: "member",
    },
  },
  { timestamps: true }
);

const Project = sequelize.define(
  "Project",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  { timestamps: true }
);

const ProjectMember = sequelize.define(
  "ProjectMember",
  {
    projectRole: {
      type: DataTypes.ENUM("admin", "member"),
      allowNull: false,
      defaultValue: "member",
    },
  },
  { timestamps: true }
);

const Task = sequelize.define(
  "Task",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("todo", "in_progress", "done"),
      allowNull: false,
      defaultValue: "todo",
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { timestamps: true }
);

User.hasMany(Project, { foreignKey: "ownerId", as: "ownedProjects" });
Project.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: "projectId",
  otherKey: "userId",
  as: "members",
});
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: "userId",
  otherKey: "projectId",
  as: "projects",
});
ProjectMember.belongsTo(User, { foreignKey: "userId" });
ProjectMember.belongsTo(Project, { foreignKey: "projectId" });

Project.hasMany(Task, { foreignKey: "projectId", as: "tasks", onDelete: "CASCADE" });
Task.belongsTo(Project, { foreignKey: "projectId", as: "project" });

User.hasMany(Task, { foreignKey: "assignedTo", as: "assignedTasks" });
Task.belongsTo(User, { foreignKey: "assignedTo", as: "assignee" });

User.hasMany(Task, { foreignKey: "createdBy", as: "createdTasks" });
Task.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

module.exports = {
  sequelize,
  User,
  Project,
  ProjectMember,
  Task,
};
