export class Projet {
    id_projet!: number;
    nom_interlocuteur!: string;
    contact_interlocuteur!: string;
    description_traitement!: string;
    id_ligne!: string;
    id_plan!: string;
    id_fonction!: string;
    id_cp!: string;
    id_type_traitement!: string;
    id_client!: number;

    constructor(init? : Partial<Projet>) {
        Object.assign(this, init);
    }
}