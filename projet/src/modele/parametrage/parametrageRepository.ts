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
            if (parametrage.client_nom) {

                const client = new Client({
                    nom: parametrage.client_nom
                })

                const verif = await client.verifier();
                if (!verif) {
                    id_client = (await clientConnect.query('INSERT INTO "detail_projet".client (nom) VALUES ($1) RETURNING id_client', [client.nom])).rows[0].id_client;
                } else {
                    id_client = verif.id_client;
                }

                console.log('id_client', id_client);
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
                `INSERT INTO "detail_projet".projet (
                    nom_interlocuteur,
                    contact_interlocuteur,
                    description_traitement,
                    id_plan,
                    id_cp,
                    id_type_traitement,
                    id_fonction,
                    id_client,
                    id_ligne
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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

            let etape_qualite_record: Record<string, any[]> = {}

            for (const element of etape) {

                if (biblio[element.operation]) {
                    biblio[element.operation] += 1;
                } else {
                    biblio[element.operation] = 0;
                }

                console.log('Objectif qualite ', element);

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

                // etape_qualite_list.push({
                //     id_etape_qualite: etape_qualite,
                //     operation: element.operation
                // });
                if (!etape_qualite_record[element.operation]) {
                    etape_qualite_record[element.operation] = [];
                }
                etape_qualite_record[element.operation].push(etape_qualite);
            }

            let erreur_type_sauve: Record<string, {
                id_type_erreur: string,
                valabilite: boolean
            }[]> = {}


            if (parametrage.type_erreur) {
                for (const typeErreur of parametrage.type_erreur) {
                    let id_colone = parametrage.id_colonnes;
                    let erreurType = (await clientConnect.query(
                        'INSERT INTO "detail_projet".type_erreur (libelle,coef,est_majeur,raccourci,id_projet) values ($1,$2,$3,$4,$5) returning id_type_erreur', [
                        typeErreur.typeErreur,
                        typeErreur.coef,
                        (typeErreur.degre != 0),
                        typeErreur.raccourci,
                        id_projet
                    ]
                    )).rows[0].id_type_erreur;
                    for (const [index, colon] of parametrage.colonne.entries()) {
                        const valable = typeErreur[colon] || false;
                        console.log('colonne valabilite ', colon, id_colone[index], valable)
                        if (!erreur_type_sauve[id_colone[index]]) {
                            erreur_type_sauve[id_colone[index]] = [];
                        }
                        erreur_type_sauve[id_colone[index]].push({
                            id_type_erreur: erreurType,
                            valabilite: valable
                        })
                    }
                }
                console.log('entre')
                console.log(erreur_type_sauve, etape_qualite_record)
                console.log('sortie')
                for (const operation in etape_qualite_record) {
                    for (const id_etape_qualite of etape_qualite_record[operation]) {
                        for (const erreur_type of erreur_type_sauve[operation]) {
                            console.log('etape', id_etape_qualite, (erreur_type as any)?.id_type_erreur, (erreur_type as any)?.valabilite)
                            if ((erreur_type as any)?.valabilite) {
                                await clientConnect.query('INSERT INTO "detail_projet".erreur_valable (id_etape_qualite, id_type_erreur) VALUES ($1, $2)', [
                                    id_etape_qualite,
                                    (erreur_type as any)?.id_type_erreur
                                ]);
                            }
                        }
                    }
                }

                // throw new Error('wait....');


                // for (const etape_qualite of etape_qualite_list) {
                // throw new Error("Wait");
                // if (etape_qualite.operation.includes(id_colone[index])) {
                //     console.log(valable, typeErreur[colon], colon, etape_qualite, id_colone[index])

                // tsy tokony unique libelle 



                // console.log('erreur ', erreurType)
                // if (valable) {
                //     await clientConnect.query('INSERT INTO "detail_projet".erreur_valable (id_etape_qualite, id_type_erreur) VALUES ($1, $2)', [
                //         etape_qualite.id_etape_qualite,
                //         erreurType
                //     ]);
                // }
                // }
                // }
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

    static async update(parametrage: Parametrage): Promise<any> {
        const clientConnect = await pool!.connect();
        try {
            await clientConnect.query('BEGIN');

            // Gestion du client
            let id_client = null;
            if (parametrage.client_nom) {
                const client = new Client({ nom: parametrage.client_nom });
                const verif = await client.verifier();
                if (!verif) {
                    id_client = (await clientConnect.query(
                        'INSERT INTO "detail_projet".client (nom) VALUES ($1) RETURNING id_client',
                        [client.nom]
                    )).rows[0].id_client;
                } else {
                    id_client = verif.id_client;
                }
            }

            // Update du projet
            await clientConnect.query(
                `UPDATE "detail_projet".projet
            SET nom_interlocuteur = $1,
                contact_interlocuteur = $2,
                description_traitement = $3,
                id_plan = $4,
                id_cp = $5,
                id_type_traitement = $6,
                id_fonction = $7,
                id_client = $8,
                id_ligne = $9
            WHERE id_projet = $10`,
                [
                    parametrage.interlocuteur_nom || '',
                    parametrage.contact_interlocuteur || '',
                    parametrage.description_traite || '',
                    parametrage.plan || '',
                    parametrage.cp_responsable || '',
                    parametrage.type_traite || '',
                    parametrage.fonction || '',
                    id_client || null,
                    parametrage.ligne || '',
                    parametrage.id_projet
                ]
            );

            // Gestion des étapes qualité
            const etape = parametrage.objectif_qualite || [];
            let biblio: Record<string, number> = {};
            let etape_qualite_record: Record<string, any[]> = {};

            // On récupère les étapes existantes pour ce projet
            const existingEtapes = (await clientConnect.query(
                'SELECT id_etape_qualite, operation_de_control FROM "detail_projet".etape_qualite WHERE id_projet = $1',
                [parametrage.id_projet]
            )).rows;

            // Suppression des étapes qui ne sont plus présentes
            const incomingOperations = etape.map(e => e.operation);
            // for (const etapeExist of existingEtapes) {
            //     if (!incomingOperations.includes(etapeExist.operation_de_control)) {
            //         await clientConnect.query(
            //             'DELETE FROM "detail_projet".erreur_valable WHERE id_etape_qualite = $1',
            //             [etapeExist.id_etape_qualite]
            //         );
            //         await clientConnect.query(
            //             'DELETE FROM "detail_projet".etape_qualite WHERE id_etape_qualite = $1',
            //             [etapeExist.id_etape_qualite]
            //         );
            //     }
            // }
            
            console.log('incoming', incomingOperations, existingEtapes)
            let exist: Record<string, string> = {};
                for (const typeExist of existingEtapes) {
                    if (incomingOperations.includes(typeExist.operation_de_control)) {
                        exist[typeExist.operation_de_control] = typeExist.id_etape_qualite;
                        continue
                    }
                }

                console.log('exist', exist )
                let nonexist = existingEtapes.filter(obj => !Object.keys(exist).includes(obj.operation_de_control))
                console.log('non exist', nonexist);

                for (const existance of nonexist) {
                    await clientConnect.query(
                        'DELETE FROM "detail_projet".erreur_valable WHERE id_etape_qualite = $1',
                        [existance.id_etape_qualite]
                    );

                    await clientConnect.query(
                        'DELETE FROM "detail_projet".etape_qualite WHERE id_etape_qualite = $1',
                        [existance.id_etape_qualite]
                    );
                }

            // Ajout/mise à jour des étapes
            for (const element of etape) {
                if (biblio[element.operation]) {
                    biblio[element.operation] += 1;
                } else {
                    biblio[element.operation] = 0;
                }

                // Vérifier si l'étape existe déjà
                let etape_qualite_id: number | null = null;
                const exist = existingEtapes.find(e => e.operation_de_control === element.operation);

                console.log('element', element)
                // throw new Error('wait ....')
                if (element.id_etape_qualite) {
                    await clientConnect.query(
                        `UPDATE "detail_projet".etape_qualite
                            SET seuil_qualite = $1,
                                coef_rejet = $2,
                                ordre = $3,
                                type_de_controle = $4,
                                id_unite_de_controle = $5,
                                operation_de_control = $6,
                                operation_a_controller = $7
                            WHERE id_etape_qualite = $8`,
                        [
                            element.seuilQualite || 0,
                            element.critereRejet || 0,
                            biblio[element.operation] || 0,
                            element.typeControl || 0,
                            element.unite || null,
                            element.operation || null,
                            element.operationAControler || null,
                            element.id_etape_qualite
                        ]
                    );
                    etape_qualite_id = element.id_etape_qualite;
                } else {
                    // Insert
                    etape_qualite_id = (await clientConnect.query(
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
                            parametrage.id_projet
                        ]
                    )).rows[0].id_etape_qualite;
                }

                if (!etape_qualite_record[element.operation]) {
                    etape_qualite_record[element.operation] = [];
                }
                etape_qualite_record[element.operation].push(etape_qualite_id);
            }


            // Gestion des types d'erreur
            let erreur_type_sauve: Record<string, {
                id_type_erreur: string,
                valabilite: boolean
            }[]> = {};

            if (parametrage.type_erreur) {
                // On récupère les types d'erreur existants
                const existingTypesErreur = (await clientConnect.query(
                    'SELECT id_type_erreur, libelle FROM "detail_projet".type_erreur WHERE id_projet = $1',
                    [parametrage.id_projet]
                )).rows;

                // Suppression des types d'erreur qui ne sont plus présents
                const incomingLibelles = parametrage.type_erreur.map(e => e.typeErreur);

                console.log('incoming', incomingLibelles, existingTypesErreur)

                let exist: Record<string, string> = {};
                for (const typeExist of existingTypesErreur) {
                    if (incomingLibelles.includes(typeExist.libelle)) {
                        exist[typeExist.libelle] = typeExist.id_type_erreur;
                        continue
                    }
                }

                let nonexist = existingTypesErreur.filter(obj => !Object.values(exist).includes(obj.id_type_erreur))
                console.log('non exist', nonexist);

                for (const existance of nonexist) {
                    await clientConnect.query(
                        'DELETE FROM "detail_projet".erreur_valable WHERE id_type_erreur = $1',
                        [existance.id_type_erreur]
                    );

                    await clientConnect.query(
                        'DELETE FROM "detail_projet".type_erreur WHERE id_type_erreur = $1',
                        [existance.id_type_erreur]
                    );
                }


                // Ajout/mise à jour des types d'erreur
                for (const typeErreur of parametrage.type_erreur) {
                    let id_colone = parametrage.id_colonnes;
                    // Vérifier si le type d'erreur existe déjà
                    let existing = existingTypesErreur.find(e => e.libelle === typeErreur.typeErreur);
                    let erreurType: string;
                    if (existing) {
                        await clientConnect.query(
                            'UPDATE "detail_projet".type_erreur SET coef = $1, est_majeur = $2, raccourci = $3 WHERE id_type_erreur = $4',
                            [
                                typeErreur.coef,
                                (typeErreur.degre != 0),
                                typeErreur.raccourci,
                                existing.id_type_erreur
                            ]
                        );
                        erreurType = existing.id_type_erreur;
                    } else {
                        erreurType = (await clientConnect.query(
                            'INSERT INTO "detail_projet".type_erreur (libelle,coef,est_majeur,raccourci,id_projet) values ($1,$2,$3,$4,$5) returning id_type_erreur',
                            [
                                typeErreur.typeErreur,
                                typeErreur.coef,
                                (typeErreur.degre != 0),
                                typeErreur.raccourci,
                                parametrage.id_projet
                            ]
                        )).rows[0].id_type_erreur;
                    }
                    for (const [index, colon] of parametrage.colonne.entries()) {
                        const valable = typeErreur[colon] || false;
                        if (!erreur_type_sauve[id_colone[index]]) {
                            erreur_type_sauve[id_colone[index]] = [];
                        }
                        erreur_type_sauve[id_colone[index]].push({
                            id_type_erreur: erreurType,
                            valabilite: valable
                        });
                    }
                }

                console.log('entre')
                console.log(erreur_type_sauve, etape_qualite_record)
                console.log('sortie')

                // Gestion des liaisons erreur_valable
                for (const operation in etape_qualite_record) {
                    for (const id_etape_qualite of etape_qualite_record[operation]) {
                        for (const erreur_type of erreur_type_sauve[operation] || []) {
                            // Vérifier si la liaison existe déjà

                            console.log('etape', id_etape_qualite, (erreur_type as any)?.id_type_erreur, (erreur_type as any)?.valabilite)
                            const existingErreurValable = (await clientConnect.query(
                                'SELECT 1 FROM "detail_projet".erreur_valable WHERE id_etape_qualite = $1 AND id_type_erreur = $2',
                                [id_etape_qualite, erreur_type.id_type_erreur]
                            )).rowCount;
                            
                            if (erreur_type.valabilite) {
                                console.log('existing erreur valable', existingErreurValable , erreur_type , !!(existingErreurValable != null && !(existingErreurValable > 0)))
                                if (existingErreurValable != null && !(existingErreurValable > 0)) {
                                    await clientConnect.query(
                                        'INSERT INTO "detail_projet".erreur_valable (id_etape_qualite, id_type_erreur) VALUES ($1, $2)',
                                        [id_etape_qualite, erreur_type.id_type_erreur]
                                    );
                                }
                            } else {
                                if (existingErreurValable != null && (existingErreurValable > 0)) {
                                    await clientConnect.query(
                                        'DELETE FROM "detail_projet".erreur_valable WHERE id_etape_qualite = $1 AND id_type_erreur = $2',
                                        [id_etape_qualite, erreur_type.id_type_erreur]
                                    );
                                }
                            }
                        }
                    }
                }

                // throw new Error('wait....');

            }

            await clientConnect.query('COMMIT');
            return parametrage.id_projet;
        } catch (error) {
            await clientConnect.query('ROLLBACK');
            throw error;
        } finally {
            clientConnect.release();
        }
    }
}