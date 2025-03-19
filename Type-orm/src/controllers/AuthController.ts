import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppDataSource from "../../ormconfig";
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
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const role = await roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      res.status(400).json({ message: "Invalid role specified" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await userRepository.save(newUser);

    res.status(201).json({ message: "User registered successfully" });
    return;
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginDTO = req.body;

    const user = await userRepository.findOne({
      where: { email },
      relations: ["role"],
    });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.role_name,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    // Set token as a cookie (optional)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.role_name,
      },
    });
    return;
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};

// LOGOUT ROUTE
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

     res.status(200).json({ message: "Logout successful, tokens cleared" });
     return
  } catch (error) {
    console.error("Logout error:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};

