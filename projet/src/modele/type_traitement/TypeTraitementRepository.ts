import { pool } from "../database/db";
import { TypeTraitement } from "./TypeTraitement";

export class TypeTraitementRepository {
    static async getAllTypeTraitements(): Promise<TypeTraitement[]> {
        try {
            const result = await pool!.query('SELECT * FROM "detail_projet".type_traitement');
            return result.rows.map((row: any) => new TypeTraitement(
                row.id_type_traitement,
                row.libelle
            ));
        } catch (error) {
            console.error("Erreur lors de la récupération des types de traitement:", error);
            throw error;
        }
    }
}