import { Request, Response } from "express";
import { TypeTraitementRepository } from "../modele/type_traitement/TypeTraitementRepository";

export class TypeTraitementController {
    static async getAllTypeTraitements(req: Request, res: Response) {
        try {
            const typeTraitements = await TypeTraitementRepository.getAllTypeTraitements();
            res.json(typeTraitements);
        } catch (error) {
            console.error("Erreur lors de la récupération des types de traitement:", error);
            res.status(500).json({ error: "Erreur lors de la récupération des types de traitement" });
        }
    }
}