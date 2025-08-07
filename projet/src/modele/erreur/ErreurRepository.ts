import { pool } from "../database/db";
import { Erreur } from "./Erreur";

export class ErreurRepository {
    static async getAll() {
        try {
            const result = await pool!.query('SELECT * FROM "detail_projet".erreur_suggestion');
            // console.log('Fetched error suggestions:', result.rows);
            // return result.rows;
            return result.rows.map((row: any) => new Erreur(row.id_erreur_suggestion, row.libelle));
        } catch (error) {
            console.error("Erreur lors de la récupération des erreurs:", error);
            throw error;
        }
    }
}