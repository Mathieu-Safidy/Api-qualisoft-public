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
                res.status(501).json({ message: 'Projet non trouvé' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la vérification du projet', error });
        }
    }

    static async verifierExterne(req: Request, res: Response) {
        const { id_projet } = req.params;
        try {
            const result = await ProjetRepository.verifierChampExterne(id_projet);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: 'Aucun paramètre externe trouvé pour ce projet' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la vérification des paramètres externes', error });
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

    static async getProjetActif(req: Request, res: Response) {
        const { date_debut, date_fin } = req.params;
        try {
            const result = await ProjetRepository.getProjetActif(date_debut, date_fin);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération des projets actifs', error });
        }
    }

    static async getProjetActifParametrer(req: Request, res: Response) {
        try {
            const { date_debut, date_fin , donnees } = req.body;
            const result = await ProjetRepository.getProjetParametrerActif(date_debut, date_fin, donnees);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération des projets paramétrés', error });
        }
    }

    static async getProjetParametrer(req: Request, res: Response) {
        try {
            console.log('getProjetParametrer called');
            
            const result = await ProjetRepository.getProjetParametrer();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération des projets paramétrés', error });
        }
    }

    static async getProjetActifParLigne(req: Request, res: Response) {
        const { date_debut, date_fin } = req.params;
        try {
            const result = await ProjetRepository.getNombreProjetParLigne(date_debut, date_fin);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération des projets actifs par ligne', error });
        }
    }

    static async getByLigne(req: Request, res: Response) {
        const { ligne } = req.params;
        try {
            const result = await ProjetRepository.getByLigne(ligne);
            res.status(200).json(result);
        } catch (error) {
            throw error;
        }
    }

    static async getProjetActifAnnuel(req: Request, res: Response) {
        const { annee } = req.params;
        try {
            const result = await ProjetRepository.getProjetActifs(annee);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération des projets actifs annuels', error });
        }
    
    }

    static async getAllTypePointages(req: Request, res: Response) {
        try {
            const result = await ProjetRepository.getAllTypePointage();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération des types de pointages', error });
        }
    }
}