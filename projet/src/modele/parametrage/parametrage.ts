import { TypeErreur } from "../erreur/Type_Erreur";
import { ObjectifQualite } from "../objectIf/ObjectifQualite";

export class Parametrage {
<<<<<<< HEAD
    client_nom!: string;
    interlocuteur_nom!: string ;
    contact_interlocuteur!: string ;
    cp_responsable!: string ;
    description_traite!: string ;
    type_traite!: string ;
=======
    client_nom: string = 'defaultClient';
    interlocuteur_nom: string = '';
    contact_interlocuteur: string = '';
    cp_responsable: string = '';
    description_traite: string = '';
    type_traite: string = '';
>>>>>>> main
    ligne?: string;
    plan?: string;
    fonction?: string;
    objectif_qualite: ObjectifQualite[] = [];
    type_erreur: any[] = [];
    colonne: any[] = [];

    constructor(init?: Partial<Parametrage>) {
        Object.assign(this, init);
    }

    
}