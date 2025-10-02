import { Request, Response } from "express";
import { VueActiviteRepository } from "../modele/vueActivite/VueActiviteRepository";

export class VueActiviteController  {
     static async getByFilter(req: Request, res: Response ) {
        try {
            const body = req.body as { ligne?: string, plan?: string, fonction?: string };
            let { ligne, plan, fonction } = body;
            const vueActiviteRepository = new VueActiviteRepository();
            const response = await vueActiviteRepository.filterActivities(ligne, plan, fonction);
            if (!response) {
                return res.status(404).json({ error: "Aucune activité trouvée" });
            }
            return res.json(response);
        } catch (error) {
            return res.status(500).json({ error: "Erreur lors de la récupération des activités" });
        }
    }

    static async getAnneExcercice(req: Request, res: Response) {
        try {
            const response = await VueActiviteRepository.getAnneExcercice();
            if (!response) {
                return res.status(404).json({ error: "Aucune année d'exercice trouvée" });
            }
            return res.json(response);
        } catch (error) {
            return res.status(500).json({ error: "Erreur lors de la récupération des années d'exercice" });
        }
    }
}