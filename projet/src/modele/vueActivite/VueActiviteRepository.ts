import axios from "axios";
import { pool } from "../database/db";

export class VueActiviteRepository {
    async filterActivities(ligne?: string, plan?: string, fonction?: string): Promise<any> {
        try {
            const data = { ligne, plan, fonction };
            const result = await axios.post(`${process.env.GPAO_API}/filtre`, data);
            return result.data;
        } catch (error) {
            console.error("Error filtering activities:", error);
            throw new Error("Erreur lors de la récupération des activités");
        }

    }

    static async getAnneExcercice(): Promise<any> {
        try {
            const result = await pool!.query(`
                select distinct on (to_char(a.mois, 'YYYY')) to_char(a.mois, 'YYYY') as anne  from db_stat.action_mois_summary a order by anne desc
            `);
            return result.rows;
        } catch (error) {
            console.error("Error fetching exercise years:", error);
            throw new Error("Erreur lors de la récupération des années d'exercice");
        }
    }
}