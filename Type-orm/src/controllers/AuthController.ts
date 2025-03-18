import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/ormconfig";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
import { LoginDTO } from "../types";

const userRepository = AppDataSource.getRepository(User);
const roleRepository = AppDataSource.getRepository(Role);

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, roleId } = req.body;

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const role = await roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    await userRepository.save(newUser);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginDTO = req.body;

    const user = await userRepository.findOne({
      where: { email },
      relations: ["role"]
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.role_name
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.role_name
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};