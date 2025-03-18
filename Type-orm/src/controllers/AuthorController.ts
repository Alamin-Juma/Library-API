import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Author } from "../entities/Author";

const authorRepository = AppDataSource.getRepository(Author);

export const getAllAuthors = async (req: Request, res: Response) => {
  try {
    const authors = await authorRepository.find({
      relations: ["books"]
    });
    return res.status(200).json(authors);
  } catch (error) {
    console.error("Error fetching authors:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAuthorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const author = await authorRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["books"]
    });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    return res.status(200).json(author);
  } catch (error) {
    console.error("Error fetching author:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createAuthor = async (req: Request, res: Response) => {
  try {
    const { name, bio } = req.body;

    // Check if author already exists
    const existingAuthor = await authorRepository.findOne({ where: { name } });
    if (existingAuthor) {
      return res.status(400).json({ message: "Author already exists" });
    }

    const author = authorRepository.create({
      name,
      bio: bio || null
    });

    await authorRepository.save(author);
    return res.status(201).json({
      message: "Author created successfully",
      author
    });
  } catch (error) {
    console.error("Error creating author:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateAuthor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, bio } = req.body;

    const author = await authorRepository.findOne({ where: { id: parseInt(id) } });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    if (name) author.name = name;
    if (bio !== undefined) author.bio = bio;

    await authorRepository.save(author);
    return res.status(200).json({
      message: "Author updated successfully",
      author
    });
  } catch (error) {
    console.error("Error updating author:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteAuthor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const author = await authorRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["books"]
    });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    if (author.books && author.books.length > 0) {
      return res.status(400).json({ message: "Cannot delete author with associated books" });
    }

    await authorRepository.delete(id);
    return res.status(200).json({ message: "Author deleted successfully" });
  } catch (error) {
    console.error("Error deleting author:", error);
    return res.status(500).json({ message: "Server error" });
  }
};