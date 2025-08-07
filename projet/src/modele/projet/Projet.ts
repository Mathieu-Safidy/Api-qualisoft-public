export class Projet {
    id_projet!: number;
    nom_interlocuteur!: string | null;
    contact_interlocuteur!: string | null;
    description_traitement!: string | null;
    id_ligne!: string | null;
    id_plan!: string | null;
    id_fonction!: string | null;
    id_cp!: string | null;
    id_type_traitement!: string;
    id_client!: number | null;

    constructor(init? : Partial<Projet>) {
        Object.assign(this, init);
    }
}