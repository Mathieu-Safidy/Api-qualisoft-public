import { Request, Response } from "express";
import { Parametrage } from "../modele/parametrage/parametrage";
import { ParametrageRepository } from "../modele/parametrage/parametrageRepository";

export class ParametrageController {
    static async create(req: any, res: any) {
        const data = req.body;
        // let clientName = data.clientDetail.client.nom_client || null; //
        let clientName = ''; //
        let interlocuteur_nom = data.interlocuteur_nom || ''; //
        let contact_interlocuteur = data.contact_interlocuteur || ''; //
        let cp_responsable = data.cp_responsable || ''; //
        let description_traite = data.description_traite || ''; //
        let type_traitement = data.type_traite || ''; //
        let ligne = data.ligne; // 
        let plan = data.plan; // 
        let fonction = data.fonction; //
        let objectif_qualite = data.formArray || []; 
        let type_erreur = data.formErreur || [];
        let colonne_operation = data.colonne || [];
        let id_colonnes = data.id_colonnes || [];

        let interlocuteurs = data.clientDetail.interlocuteur || [];
       

        if (colonne_operation.length !== 0) {
            colonne_operation = colonne_operation.filter((col: any) => col && col !== null && col !== undefined);
        }

        const parametrage = new Parametrage({
            client_nom: clientName,
            interlocuteur_nom: interlocuteur_nom,
            contact_interlocuteur: contact_interlocuteur,
            cp_responsable: cp_responsable,
            description_traite: description_traite,
            type_traite: type_traitement,
            ligne: ligne,
            plan: plan,
            fonction: fonction,
            objectif_qualite: objectif_qualite,
            type_erreur: type_erreur,
            colonne: colonne_operation,
            id_colonnes: id_colonnes,
            interlocuteurs: interlocuteurs
        });

        console.log('Parametrage:', parametrage);

        const id_projet = await ParametrageRepository.create(parametrage);

        return res.status(201).json({ parametre: id_projet,message: 'Paramétrage créé' });
    }

    static async update(req: any, res: any) {
        const data = req.body;
        // let clientName = data.client_nom || null; //
        let clientName = ''; //
        let interlocuteur_nom = data.interlocuteur_nom || ''; //
        let contact_interlocuteur = data.contact_interlocuteur || ''; //
        let cp_responsable = data.cp_responsable || ''; //
        let description_traite = data.description_traite || ''; //
        let type_traitement = data.type_traite || ''; //
        let ligne = data.ligne; // 
        let plan = data.plan; // 
        let fonction = data.fonction; //
        let objectif_qualite = data.formArray || []; 
        let type_erreur = data.formErreur || [];
        let colonne_operation = data.colonne || [];
        let id_colonnes = data.id_colonnes || [];
        let id_projet_in = data.id_projet || ''; 
        let interlocuteurs = data.clientDetail.interlocuteur || [];
       

        if (colonne_operation.length !== 0) {
            colonne_operation = colonne_operation.filter((col: any) => col && col !== null && col !== undefined);
        }

        const parametrage = new Parametrage({
            client_nom: clientName,
            interlocuteur_nom: interlocuteur_nom,
            contact_interlocuteur: contact_interlocuteur,
            cp_responsable: cp_responsable,
            description_traite: description_traite,
            type_traite: type_traitement,
            ligne: ligne,
            plan: plan,
            fonction: fonction,
            objectif_qualite: objectif_qualite,
            type_erreur: type_erreur,
            colonne: colonne_operation,
            id_colonnes: id_colonnes,
            id_projet: id_projet_in,
            interlocuteurs: interlocuteurs
        });

        console.log('Parametrage:', parametrage);

        

        const id_projet = await ParametrageRepository.update(parametrage);

        return res.status(201).json({ parametre: id_projet,message: 'Paramétrage créé' });
    }

    static async updateOptional(req: Request, res: Response) {
        const corps = req.body;
        try {
            const updated = await ParametrageRepository.upSertOptional(corps);
            return res.status(200).json({ parametre: updated, message: 'Paramétrage mis à jour' });
        } catch (error) {
            console.error('Error updating optional parameters:', error);
            return res.status(500).json({ message: 'Erreur lors de la mise à jour des paramètres optionnels' });
        }
    }
}