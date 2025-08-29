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
    static async getUnitesById(req: Request, res: Response) {
        try {
            const { id_unite } = req.params;
            const unite = await UniteRepository.getUnitesById(id_unite);
            res.status(200).json(unite);
        } catch (error) {
            console.error('Error fetching unite by ID:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}