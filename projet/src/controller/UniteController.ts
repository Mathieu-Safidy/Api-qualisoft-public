import { Request, Response } from "express";
import { UniteRepository } from "../modele/unite/UniteRepository";

export class UniteController {
    static async getUnites(req: Request, res: Response) {
        try {
            const unites = await UniteRepository.getAllUnites();
            res.status(200).json(unites);
        } catch (error) {
            console.error('Error fetching unites:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}