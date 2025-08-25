import { Request, Response } from "express";
import { UserRepository } from "../modele/user/userRepository";

export class UserController {
    static async getAllUsers(req: Request, res: Response) {
        try {
            const users = await UserRepository.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}