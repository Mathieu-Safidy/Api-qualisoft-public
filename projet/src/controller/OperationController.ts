import { Request, Response } from "express";
import { OperationRepository } from "../modele/operation/OperationRepository";

export class OperationController {
    static async getAllOperations(req: Request, res: Response) {
        try {
            const operations = await OperationRepository.getAllOperations();
            return res.status(200).json(operations);
        } catch (error) {
            console.error('Error fetching operations:', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des opérations' });
        }
    }

    static async getRepartitionTypeOperation(req: Request, res: Response) {
        try {
            const result = await OperationRepository.getRepartitionTypeOperation();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération de la répartition des types d\'opération', error });
        }
    }
}