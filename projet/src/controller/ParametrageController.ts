export class ParametrageController {
    static async create(req: any, res: any) {
        const data = req.body;
        let clientName = data.client_nom || 'defaultClient';
        let interlocuteur_nom = data.interlocuteur_nom || '';
        let contact_interlocuteur = data.contact_interlocuteur || '';
        let cp_responsable = data.cp_responsable || '';
        let description_traite = data.description_traite || '';
        let type_traitement = data.type_traite || '';
        let ligne = data.ligne;
        let plan = data.plan;
        let fonction = data.fonction;
        let objectif_qualite = data.formArray || [];
        let type_erreur = data.formErreur || [];
        let colonne_operation = data.colonne || [];

        if (colonne_operation.length !== 0) {
            colonne_operation = colonne_operation.filter((col: any) => col && col !== null && col !== undefined);
        }

        return res.status(201).json({ message: 'Paramétrage créé' });
    }
}