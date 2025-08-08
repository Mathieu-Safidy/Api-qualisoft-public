import { Request, Response } from "express";
import { Client } from "../modele/client/Client";

export class ClientController {
    static async getById(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const result = await Client.getClient(id);
            if (result) {
                res.status(201).json(result)
            } else {
                res.status(404).json({data: [], message: `Aucun client n'a été trouvé`})
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du client:', error);
            res.status(500).json({ message: 'Erreur interne du serveur' });
        }
    }
}