import axios from "axios";
import { Request, Response } from "express";
import { pool } from "../database/db";

export class ProjetRepository {
    static async getAllProjetActif() : Promise<any> {
        try {
            const result = await axios.get(`${process.env.GPAO_API}/projets`);
            // console.log(result.data);
            return result.data;
        } catch (error) {
            console.error('Une erreur sest produit dans la lecture des projets actif')
            throw new Error('Une erreur sest produit dans la lecture des projets actif');
        }
    }

    static async verifier(ligne: string,plan: string,fonction: string) {
        try {
            const result = await pool!.query(`select * from "detail_projet".projet where (id_ligne) = ($1) and (id_plan) = ($2) and (id_fonction) = ($3)`, [ligne, plan, fonction]);
            return result.rows;
        } catch (error) {
            console.error('Une erreur est survenue lors de la vérification du projet:', error);
            throw error;
        }
    }
}