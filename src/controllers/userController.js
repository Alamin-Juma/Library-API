const { User } = require("../models");

module.exports = {
  // List all users
  async listUsers(req, res) {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users", details: error.message });
    }
  },

  // Get a single user
  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ error: "User not found" });

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user", details: error.message });
    }
  },

  // Create a user
  async createUser(req, res) {
    try {
      const { name, email } = req.body;
      const user = await User.create({ name, email });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Failed to create user", details: error.message });
    }
  },

  // Update a user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ error: "User not found" });

      await user.update({ name, email });
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: "Failed to update user", details: error.message });
    }
  },

  // Delete a user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await User.destroy({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user", details: error.message });
    }
  },
};
