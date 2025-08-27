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
    static async verif(req: Request, res: Response) {
        const { ligne, plan, fonction } = req.params;
        try {
            const result = await ProjetRepository.verifier(ligne, plan, fonction);
            console.log(result)
            if (result.projet) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: 'Projet non trouvé' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la vérification du projet', error });
        }
    }
 
    static async verifClone(req: Request, res: Response) {
        const { plan, fonction } = req.params;
        try {
            const result = await ProjetRepository.verifierClone(plan, fonction);
            console.log(result)
            if (result.projet) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: 'Projet non trouvé' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la vérification du projet', error });
        }
    }

    static async duplicateErrorType(req: Request, res: Response) {
        try {
            const { source, target } = req.body;
            await ProjetRepository.duplicate(source, target);
            res.status(200).json({ message: 'Type d\'erreur dupliqué avec succès' });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la duplication du type d\'erreur', error });
        }
    }
}