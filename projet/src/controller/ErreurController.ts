import { Request, Response } from "express";
import { ErreurRepository } from "../modele/erreur/ErreurRepository";

export class ErreurController {
    static async getErreurSuggestions(req: Request, res: Response) {
        try {
            const erreurs = await ErreurRepository.getAll();
            // console.log('Fetched error suggestions:', await erreurs);
            return res.status(200).json(erreurs);
        } catch (error) {
            console.error('Error fetching error suggestions:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}