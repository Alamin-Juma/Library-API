import { Request, Response } from "express";
import AppDataSource  from "../../ormconfig";
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
     res.status(200).json(users);
     return
  } catch (error) {
    console.error("Error fetching users:", error);
     res.status(500).json({ message: "Server error" });
     return
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
       res.status(404).json({ message: "User not found" });
       return
    }

     res.status(200).json(user);
     return
  } catch (error) {
    console.error("Error fetching user:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, roleId } = req.body;

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
       res.status(400).json({ message: "User already exists" });
       return
    }

    // Check if role exists
    const role = await roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
       res.status(400).json({ message: "Role not found" });
       return
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

     res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: role.role_name
      }
    });
    return
  } catch (error) {
    console.error("Error creating user:", error);
     res.status(500).json({ message: "Server error" });
     return
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
       res.status(404).json({ message: "User not found" });
       return
    }

    // Update fields if provided
    if (name) user.name = name;
    
    if (email && email !== user.email) {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser && existingUser.id !== parseInt(id)) {
         res.status(400).json({ message: "Email already in use" });
         return
      }
      user.email = email;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (roleId) {
      const role = await roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
         res.status(400).json({ message: "Role not found" });
         return
      }
      user.role = role;
    }

    await userRepository.save(user);

     res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
    return
  } catch (error) {
    console.error("Error updating user:", error);
     res.status(500).json({ message: "Server error" });
     return
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
       res.status(404).json({ message: "User not found" });
       return
    }

    const hasActiveBorrowings = user.borrowRecords.some(record => !record.return_date);
    if (hasActiveBorrowings) {
       res.status(400).json({ message: "Cannot delete user with active borrowings" });
       return
    }

    await userRepository.delete(id);
     res.status(200).json({ message: "User deleted successfully" });
     return
  } catch (error) {
    console.error("Error deleting user:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};