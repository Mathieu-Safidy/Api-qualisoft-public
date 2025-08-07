import { throwDeprecation } from "process";
import { pool } from "../database/db";
import { Parametrage } from "./parametrage";
import { Projet } from "../projet/Projet";
import { Client } from "../client/Client";
import { ObjectifQualite } from "../objectIf/ObjectifQualite";

export class ParametrageRepository {
    static async create(parametrage: Parametrage): Promise<any> {
        const clientConnect = await pool!.connect();
        try {
            await clientConnect.query('BEGIN');
            // de base
                // projet
                    // interlocuteur nom 
                    // contact_interlocuteur
                    // description traitement
                    // ligne / plan / fonction
                    // cp id
                    // id traitement
                    // table(client) => // client 
                // 
                // retour de id Projet
                // 
                // etape qualite (dans formArray)
                    // id operation de control
                    // id operation a controller
                    // id unite
                    // type de controlle
                    // seuil qualite
                    // critere de rejet == coef de rejet
                    // ordre => si meme operation de controlle == different ordre
                // si type d'erreur non existant: type derreur (dans formErreur)
                    // => ajout de type_erreur dans erreur_suggestion
                // formErreur[index][colonne_operation] => [ID,true||false]
                    // type_erreur
                    // coef
                    // if degre == 1
                    // raccourci
                    // si true 
                        // erreur_valable
                            // id etape qualite
                            // id type erreur 
            const client = new Client({
                nom: parametrage.client_nom
            })

            const verif = client.verifier();
            let id_client = 0;
            if(!verif) {
                id_client = (await clientConnect.query('INSERT INTO "detail_projet".client (nom) VALUES ($1) RETURNING id_client', [client.nom])).rows[0].id_client;
            }else{
                id_client = verif.id_client;
            }

            const projet = new Projet({
                nom_interlocuteur:      parametrage.interlocuteur_nom,
                contact_interlocuteur:  parametrage.contact_interlocuteur,
                description_traitement: parametrage.description_traite,
                id_ligne:               parametrage.ligne,
                id_plan:                parametrage.plan,
                id_fonction:            parametrage.fonction,
                id_cp:                  parametrage.cp_responsable,
                id_type_traitement:     parametrage.type_traite,
                id_client:              id_client
            });

            const id_projet = (await clientConnect.query('INSERT INTO "detail_projet".projet (nom_interlocuteur, contact_interlocuteur, description_traitement, id_ligne, id_plan, id_fonction, id_cp, id_type_traitement, id_client) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_projet', [
                projet.nom_interlocuteur,
                projet.contact_interlocuteur,
                projet.description_traitement,
                projet.id_ligne,
                projet.id_plan,
                projet.id_fonction,
                projet.id_cp,
                projet.id_type_traitement,
                projet.id_client
            ])).rows[0].id_projet;

            const ordre : Record<string, number> = {};

            for (const objectif of parametrage.objectif_qualite) {
                if (!ordre[objectif.operation_de_controle]) {
                    ordre[objectif.operation_de_controle] = 1;
                } 
                const objectifQualite = new ObjectifQualite(objectif);
                await clientConnect.query('INSERT INTO "detail_projet".etape_qualite (id_etape_qualite, seuil_qualite, coef_rejet, ordre, type_de_controle, id_unite_de_controle, operation_de_controle, operation_a_controle, id_projet) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
                    objectifQualite.id_etape_qualite,
                    objectifQualite.seuil_qualite,
                    objectifQualite.coef_rejet,
                    ordre[objectif.operation_de_controle],
                    objectifQualite.type_de_controle,
                    objectifQualite.id_unite_de_controle,
                    objectifQualite.operation_de_controle,
                    objectifQualite.operation_a_controle,
                    id_projet
                ]);
                ordre[objectif.operation_de_controle]++;
            }



            await clientConnect.query('COMMIT'); 
        } catch (error) {
            await clientConnect.query('ROLLBACK');
            throw error;
        } finally {
            clientConnect.release();
        }
    }
}