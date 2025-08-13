import axios from "axios";
import { Request, Response } from "express";
import { pool } from "../database/db";

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

    static async verifEtapeQualite(id_projet: string) {
        try {
            if (id_projet) {
                const result = await pool!.query(`SELECT * FROM  "detail_projet".etape_qualite where id_projet = $1 `, [id_projet]);
                return result.rows;
            } else {
                throw new Error('Projet non reconnue');
            }
        } catch (error) {
            throw error;
        }
    }

    static async verifierTypeErreur(id_projet: string) {
        try {
            const result = await pool!.query(`SELECT 
                    te.id_type_erreur,
                    te.est_majeur ,
                    te.coef ,
                    te.raccourci ,
                    te.libelle AS libelle_erreur,
                    eq.id_etape_qualite,
                    eq.operation_de_control,
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
}