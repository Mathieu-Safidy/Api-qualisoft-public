import axios from "axios";
import { pool } from "../database/db";

export class OperationRepository {
    static async getAllOperations(): Promise<any> {
        try {
            const result = await axios.get(`${process.env.GPAO_API}/operations`);
            return result.data;
        } catch (error) {
            console.error('Error fetching operations:', error);
            throw error;
        }
    }

     static async getRepartitionTypeOperation() {
            try {
                const result = await pool!.query(`
                    SELECT
                    COUNT(DISTINCT CASE WHEN type_de_controle = 0 THEN id_projet END) AS interne,
                    COUNT(DISTINCT CASE WHEN type_de_controle = 1 THEN id_projet END) AS bcq,
                    COUNT(DISTINCT CASE WHEN type_de_controle = 2 THEN id_projet END) AS externe
                    FROM detail_projet.etape_qualite;
                `);
                return result.rows[0];
            } catch (error) {
                throw error;
            }
        }
}