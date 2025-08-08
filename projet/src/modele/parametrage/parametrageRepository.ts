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
                // id projet
                // id operation de control
                // id operation a controller
                // id unite
                // type de controlle
                // seuil qualite
                // critere de rejet == coef de rejet
                // ordre => si meme operation de controlle == different ordre (compar * 2 => ordre 1 et 2 )
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
            let id_client = null;
            console.log(parametrage.client_nom)
            if(parametrage.client_nom) {

                const client = new Client({
                    nom: parametrage.client_nom
                })
                
                const verif = await client.verifier();
                if (!verif) {
                    id_client = (await clientConnect.query('INSERT INTO "detail_projet".client (nom) VALUES ($1) RETURNING id_client', [client.nom])).rows[0].id_client;
                } else {
                    id_client = verif.id_client;
                }

                console.log('id_client',id_client);
            }
                
            const projet = new Projet({
                nom_interlocuteur: parametrage.interlocuteur_nom || '',
                contact_interlocuteur: parametrage.contact_interlocuteur || '',
                description_traitement: parametrage.description_traite || '',
                id_ligne: parametrage.ligne || '',
                id_plan: parametrage.plan || '',
                id_fonction: parametrage.fonction || '',
                id_cp: parametrage.cp_responsable || '',
                id_type_traitement: parametrage.type_traite || '',
                id_client: id_client || null
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

            let biblio: Record<string, number> = {};

            let etape_qualite_list: { id_etape_qualite: number, operation: string }[] = [];

            for (const element of etape) {

                if (biblio[element.operation]) {
                    biblio[element.operation] += 1;
                } else {
                    biblio[element.operation] = 0;
                }

                console.log('Objectif qualite ',element);

                const etape_qualite = (await clientConnect.query(
                    `INSERT INTO "detail_projet".etape_qualite (
                        seuil_qualite,
                        coef_rejet,
                        ordre,
                        type_de_controle,
                        id_unite_de_controle,
                        operation_de_control,
                        operation_a_controller,
                        id_projet
                    ) values ($1, $2, $3, $4, $5, $6, $7, $8) returning id_etape_qualite`,
                    [
                        element.seuilQualite || 0,
                        element.critereRejet || 0,
                        biblio[element.operation] || 0,
                        element.typeControl || null,
                        element.unite || null,
                        element.operation || null,
                        element.operationAControler || null,
                        id_projet
                    ]
                )).rows[0].id_etape_qualite;

                etape_qualite_list.push({
                    id_etape_qualite: etape_qualite,
                    operation: element.operation
                });
            }

            if (parametrage.type_erreur) {
                for (const typeErreur of parametrage.type_erreur) {
                    let id_colone = parametrage.id_colonnes;
                    for (const [index, colon] of parametrage.colonne.entries()) {
                        const valable = typeErreur[colon];
                        
                        if (valable) {
                            for (const etape_qualite of etape_qualite_list) {
                                console.log(valable , typeErreur[colon] , colon , etape_qualite , id_colone[index])
                                // throw new Error("Wait");
                                if (etape_qualite.operation.includes(id_colone[index])) {
                                    let erreurType = (await clientConnect.query(
                                        'INSERT INTO "detail_projet".type_erreur (libelle,coef,est_majeur,raccourci,id_projet) values ($1,$2,$3,$4,$5) returning id_type_erreur',[
                                            colon,
                                            typeErreur.coef,
                                            (typeErreur.degre != 0),
                                            typeErreur.raccourci,
                                            id_projet
                                        ]
                                    )).rows[0].id_type_erreur;
                                    console.log('erreur ',erreurType)
                                    await clientConnect.query('INSERT INTO "detail_projet".erreur_valable (id_etape_qualite, id_type_erreur) VALUES ($1, $2)', [
                                        etape_qualite.id_etape_qualite,
                                        erreurType
                                    ]);
                                }
                            }
                        }
                    }
                }
            }
            await clientConnect.query('COMMIT');
            return id_projet;
        } catch (error) {
            await clientConnect.query('ROLLBACK');
            throw error;
        } finally {
            clientConnect.release();
        }
    }
}