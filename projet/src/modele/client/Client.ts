import axios from "axios";
import { pool } from "../database/db";

export class Client {
    id_client!: number;
    nom!: string;

    constructor(init: Partial<Client>) {
        Object.assign(this, init);
    }

    async verifier() {
        try {
            const result: any = await pool!.query('select * from "detail_projet".client where LOWER(nom) = LOWER($1)', [this.nom]);
            console.log(result)
            if (result.rows && result.rowCount > 0) {
                return new Client({
                    id_client: result.rows[0].id_client,
                    nom: result.rows[0].nom
                });
            }else{
                return false;
            }
        } catch (error) {
            console.log('Une erreur est survenue lors de la vérification du client:', error);
            throw error;
        }
    }

    static async getClient(id_client: string) {
        try {
            // const result: any = await pool!.query(`SELECT * FROM "detail_projet".client WHERE id_client = $1`, [id_client]);
            const result: any = await axios.get(`${process.env.GPAO_API}/projets/MADAGASCAR/${id_client}`);
            if (result.status === 200) {
                return new Client({
                    id_client: result.data.id_plan,
                    nom: result.data.libelle
                });
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        }
    }
}