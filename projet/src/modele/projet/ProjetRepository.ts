import axios from "axios";
import { Request, Response } from "express";
import { pool } from "../database/db";
import { Projet } from "./Projet";
import { PoolClient } from "pg";
import { TypeErreur } from "../erreur/Type_Erreur";

export class ProjetRepository {
    static async getAllProjetActif(): Promise<any> {
        try {
            const result = await axios.get(`${process.env.GPAO_API}/projets`);
            // console.log(result.data);
            return result.data;
        } catch (error) {
            console.error('Une erreur sest produit dans la lecture des projets actif')
            throw new Error('Une erreur sest produit dans la lecture des projets actif');
        }
    }

    static async verifier(ligne: string, plan: string, fonction: string) {
        try {
            const result = await pool!.query(`select * from "detail_projet".projet where (id_ligne) = ($1) and (id_plan) = ($2) and (id_fonction) = ($3)`, [ligne, plan, fonction]);
            const etape_qualite = await this.verifEtapeQualite(result.rows[0]?.id_projet);
            const type_erreur = await this.verifierTypeErreur(result.rows[0]?.id_projet);
            const interlocuteurs = await this.verifierInterlocuteur(result.rows[0]?.id_projet);
            // console.log('id projet', result.rows[0]?.id_projet , etape_qualite , type_erreur)
            return {
                projet: result.rows[0],
                etape: etape_qualite,
                erreur: type_erreur,
                interlocuteurs: interlocuteurs
            };
        } catch (error) {
            console.error('Une erreur est survenue lors de la vérification du projet:', error);
            throw error;
        }
    }
    static async verifierClone(plan: string, fonction: string) {
        try {
            const result = await pool!.query(`select * from "detail_projet".projet where (id_plan) = ($1) and (id_fonction) = ($2)`, [plan, fonction]);
            const etape_qualite = await this.verifEtapeQualite(result.rows[0]?.id_projet);
            const type_erreur = await this.verifierTypeErreur(result.rows[0]?.id_projet);
            const interlocuteurs = await this.verifierInterlocuteur(result.rows[0]?.id_projet);
            // console.log('id projet', result.rows[0]?.id_projet , etape_qualite , type_erreur)
            return {
                projet: result.rows[0],
                etape: etape_qualite,
                erreur: type_erreur,
                interlocuteurs: interlocuteurs
            };
        } catch (error) {
            console.error('Une erreur est survenue lors de la vérification du projet:', error);
            throw error;
        }
    }

    static async verifEtapeQualite(id_projet: string) {
        try {
            if (id_projet) {
                const result = await pool!.query(`SELECT * FROM  "detail_projet".etape_qualite where id_projet = $1 `, [id_projet]);
                return result.rows;
            }
            //  else {
            //     throw new Error('Projet non reconnue');
            // }
        } catch (error) {
            throw error;
        }
    }

    static async verifierTypeErreurCopy(id_projet: string) {
        try {
            let result = await pool!.query(`select distinct on (libelle, coef, est_majeur, raccourci, id_projet) id_type_erreur, libelle AS libelle_erreur, coef, est_majeur, raccourci, id_projet
                    FROM detail_projet.type_erreur
                    WHERE id_projet = $1
                `
                , [id_projet]);

            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async verifierTypeErreur(id_projet: string) {
        try {
            let result = await pool!.query(`SELECT 
                    te.id_type_erreur,
                    te.est_majeur ,
                    te.coef ,
                    te.raccourci ,
                    te.libelle AS libelle_erreur,
                    eq.id_etape_qualite,
                    eq.operation_de_control,
                    te.id_projet,
                    CASE WHEN ev.id_type_erreur IS NOT NULL THEN true ELSE false END AS valable
                    FROM detail_projet.type_erreur te
                    CROSS JOIN detail_projet.etape_qualite eq
                    LEFT JOIN detail_projet.erreur_valable ev
                    ON ev.id_type_erreur = te.id_type_erreur
                    AND ev.id_etape_qualite = eq.id_etape_qualite
                    WHERE te.id_projet = $1
                    AND eq.id_projet = $1
                    ORDER BY te.id_type_erreur, eq.operation_de_control;`
                , [id_projet]);
            if (result.rowCount == 0) {
                result = await pool!.query(`
                    SELECT id_type_erreur, libelle AS libelle_erreur, coef, est_majeur, raccourci, id_projet
                    FROM detail_projet.type_erreur
                    WHERE id_projet = $1
                `, [id_projet]);
            }
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async verifierInterlocuteur(id_projet: string) {
        try {
            const result = await pool!.query(`SELECT * FROM "detail_projet".interlocuteur WHERE id_projet = $1`, [id_projet]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async getByLPF(ligne: string, plan: string, fonction: string) {
        try {
            const result = await pool!.query(`SELECT * FROM "detail_projet".projet WHERE id_ligne = $1 AND id_plan = $2 AND id_fonction = $3`, [ligne, plan, fonction]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async duplicate(source: { ligne: string, plan: string, fonction: string }, target: { ligne: string, plan: string, fonction: string }) {
        const client = await pool!.connect();
        // throw new Error("This is a test error");
        try {

            await client.query('BEGIN');

            const result = await this.getByLPF(source.ligne, source.plan, source.fonction);
            const targetProjet = await this.getByLPF(target.ligne, target.plan, target.fonction);
            let type_erreur = await this.verifierTypeErreurCopy(result[0]?.id_projet);
            if (targetProjet.length > 0) {
                type_erreur = type_erreur.map((te: any) => ({ ...te, id_projet: targetProjet[0]?.id_projet }));
                let body: any[] = [];
                for (const te of type_erreur) {
                    body.push(TypeErreur.castInsert(te));
                }
                await this.insertBatch<TypeErreur>(client, `"detail_projet".type_erreur`, body);
            } else {
                let newProjet = new Projet({
                    id_ligne: target.ligne,
                    id_plan: target.plan,
                    id_fonction: target.fonction
                });
                newProjet.id_projet = await this.createProjetTrans(client, newProjet);
                type_erreur = type_erreur.map((te: any) => ({ ...te, id_projet: newProjet.id_projet }));
                let body: any[] = [];
                for (const te of type_erreur) {
                    body.push(TypeErreur.castInsert(te));
                }
                await this.insertBatch<TypeErreur>(client, `"detail_projet".type_erreur`, body);
            }

            await client.query('COMMIT');

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async createProjet(projet: Projet): Promise<number> {
        try {
            const result = await pool!.query(
                `INSERT INTO "detail_projet".projet 
                (nom_interlocuteur, contact_interlocuteur, description_traitement, id_ligne, id_plan, id_fonction, id_cp, id_type_traitement, id_client) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_projet`,
                [
                    projet.nom_interlocuteur || '',
                    projet.contact_interlocuteur || '',
                    projet.description_traitement || '',
                    projet.id_ligne,
                    projet.id_plan,
                    projet.id_fonction,
                    projet.id_cp || '',
                    projet.id_type_traitement || '',
                    projet.id_client || ''
                ]
            );
            return result.rows[0].id_projet;
        } catch (error) {
            throw error;
        }
    }
    static async createProjetTrans(connection: PoolClient, projet: Projet): Promise<number> {
        try {
            const result = await connection!.query(
                `INSERT INTO "detail_projet".projet 
                (nom_interlocuteur, contact_interlocuteur, description_traitement, id_ligne, id_plan, id_fonction, id_cp, id_type_traitement, id_client) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_projet`,
                [
                    projet.nom_interlocuteur || '',
                    projet.contact_interlocuteur || '',
                    projet.description_traitement || '',
                    projet.id_ligne,
                    projet.id_plan,
                    projet.id_fonction,
                    projet.id_cp || '',
                    projet.id_type_traitement || '',
                    projet.id_client || ''
                ]
            );
            return result.rows[0].id_projet;
        } catch (error) {
            throw error;
        }
    }

    static async createTypeErreur(connection: PoolClient, typeErreur: any): Promise<number> {
        try {
            const result = await connection!.query(
                `INSERT INTO "detail_projet".type_erreur (libelle,coef,est_majeur,raccourci,id_projet) 
                VALUES ($1, $2, $3, $4, $5) RETURNING id_type_erreur`,
                [
                    typeErreur.libelle || '',
                    typeErreur.coef || 0,
                    (typeErreur.est_majeur != 0) || false,
                    typeErreur.raccourci || '',
                    typeErreur.id_projet || 0
                ]
            );
            return result.rows[0].id_type_erreur;
        } catch (error) {
            throw error
        }
    }

    static async insertBatch<T>(connection: PoolClient, table: string, rows: T[]): Promise<void> {
        if (rows.length === 0) return;

        const columns = Object.keys(rows[0] as object);
        const values = rows.map((_, i) =>
            `(${columns.map((_, j) => `$${i * columns.length + j + 1}`).join(', ')})`
        ).join(', ');

        const params = rows.flatMap(row => columns.map(col => (row as any)[col]));

        const query = `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES ${values}
    `;
        try {
            await connection!.query(query, params);
        } catch (error) {
            throw error;
        }
    }

}