import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
import bcrypt from "bcryptjs";

const userRepository = AppDataSource.getRepository(User);
const roleRepository = AppDataSource.getRepository(Role);

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepository.find({
      relations: ["role"],
      select: ["id", "name", "email"]
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["role"],
      select: ["id", "name", "email"]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, roleId } = req.body;

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if role exists
    const role = await roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      return res.status(400).json({ message: "Role not found" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = userRepository.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    await userRepository.save(newUser);

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: role.role_name
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, roleId } = req.body;

    const user = await userRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (name) user.name = name;
    
    if (email && email !== user.email) {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (roleId) {
      const role = await roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        return res.status(400).json({ message: "Role not found" });
      }
      user.role = role;
    }

    await userRepository.save(user);

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user has any active borrowings
    const user = await userRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["borrowRecords"]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasActiveBorrowings = user.borrowRecords.some(record => !record.return_date);
    if (hasActiveBorrowings) {
      return res.status(400).json({ message: "Cannot delete user with active borrowings" });
    }

    await userRepository.delete(id);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};