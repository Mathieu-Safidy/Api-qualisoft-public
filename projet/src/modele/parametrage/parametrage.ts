import { TypeErreur } from "../erreur/Type_Erreur";
import { ObjectifQualite } from "../objectIf/ObjectifQualite";

export class Parametrage {
    client_nom!: string;
    interlocuteur_nom!: string ;
    contact_interlocuteur!: string ;
    cp_responsable!: string ;
    description_traite!: string ;
    type_traite!: string ;
    ligne?: string;
    plan?: string;
    fonction?: string;
    objectif_qualite: ObjectifQualite[] = [];
    type_erreur: any[] = [];
    colonne: any[] = [];
    id_colonnes: any[] = [];
    id_projet!: string;
    interlocuteurs: any[] = [];

    constructor(init?: Partial<Parametrage>) {
        Object.assign(this, init);
    }

    
}