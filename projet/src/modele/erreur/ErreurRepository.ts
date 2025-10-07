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

    static async verifierErreurProjet(ligne: string, plan: string, fonction: string): Promise<any> {
        try {
            const result = await pool!.query(`select * from "detail_projet".projet where (id_ligne) = ($1) and (id_plan) = ($2) and (id_fonction) = ($3)`, [ligne, plan, fonction]);

            const type_erreur = await this.verifierTypeErreur(result.rows[0]?.id_projet);

            return type_erreur
        } catch (error) {
            throw error;
        }
    }

     static async verifierTypeErreur(id_projet: string) {
        try {
            let result = await pool!.query(`SELECT 
                    DISTINCT ON (te.id_type_erreur,eq.operation_de_control)
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

}