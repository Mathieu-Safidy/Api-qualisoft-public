import { Request, Response } from "express";
import { ProjetRepository } from "../modele/projet/ProjetRepository";

export class ProjetController {
    static async getAll(req: Request, res: Response) {
        try {
            const result = await ProjetRepository.getAllProjetActif();
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({message:'Une erreur s\'est produite' })
        }
    }
}