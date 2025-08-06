import { throwDeprecation } from "process";
import { pool } from "../database/db";
import { Parametrage } from "./parametrage";
import { Projet } from "../projet/Projet";
import { Client } from "../client/Client";

export class ParametrageRepository {
    static async create(parametrage: Parametrage): Promise<any> {
        const clientConnect = await pool.connect();
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

            const id_projet = (await clientConnect.query(
                `INSERT INTO "detail_projet".projet 
                (nom_interlocuteur, contact_interlocuteur, description_traitement, id_plan, id_cp, id_type_traitement,id_fonction, id_client , id_ligne) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                RETURNING id_projet`, 
                [  
                    projet.nom_interlocuteur, 
                    projet.contact_interlocuteur, 
                    projet.description_traitement,
                    projet.id_plan,  
                    projet.id_cp, 
                    projet.id_type_traitement, 
                    projet.id_fonction,
                    projet.id_client, 
                    projet.id_ligne
                ]
            )).rows[0].id_projet;

            const etape = parametrage.objectif_qualite || [];

            let biblio : Record<string,number> = {};

            let etape_qualite_list: {id_etape_qualite: number, operation: string}[] = [];
            // let etape_qualite_list: Array<EtapeQualite> = [{ id_etape_qualite: 0, operation: '' }];
            
            for (const element of etape) {
                
                let ordre = 0;
                if (element.operation_de_controle in biblio) {
                    ordre = biblio[element.operation_de_controle];
                    biblio[element.operation_de_controle] += 1;
                } else {
                    biblio[element.operation_de_controle] = 0;
                }

                const etape_qualite = (await clientConnect.query(
                    `INSERT INTO "detail_projet".etape_qualite (
                        seuil_qualite,
                        coef_rejet,
                        ordre,
                        type_de_controle,
                        id_unite_de_controle,
                        operation_de_controle,
                        operation_a_controle,
                        id_projet
                    ) values ($1, $2, $3, $4, $5, $6, $7, $8) returning id_etape_qualite`,
                    [
                        element.seuil_qualite,
                        element.coef_rejet,
                        ordre,
                        element.type_de_controle,
                        element.id_unite_de_controle,
                        element.operation_de_controle,
                        element.operation_a_controle,
                        id_projet
                    ]
                )).rows[0].id_etape_qualite;
                
                etape_qualite_list.push({
                    id_etape_qualite: etape_qualite,
                    operation: element.operation_de_controle
                });
            }

            for(const typeErreur of parametrage.type_erreur) {
                for (const colon of parametrage.colonne){
                    const valable = typeErreur[colon];
                    if(valable) {
                        
                    }
                }
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