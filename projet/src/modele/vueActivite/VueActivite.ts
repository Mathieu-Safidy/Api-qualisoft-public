import { Request, Response } from "express";
import { VueActiviteRepository } from "./VueActiviteRepository";

export class VueActivite { 
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
}