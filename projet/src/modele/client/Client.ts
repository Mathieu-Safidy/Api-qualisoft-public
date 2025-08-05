import { pool } from "../database/db";

export class Client {
    id_client!: number;
    nom!: string;

    constructor(init: Partial<Client>) {
        Object.assign(this, init);
    }

    verifier() {
        try {
            const result: any = pool.query('select * from "detail_projet".client where nom = $1', [this.nom]);
            if (result.rows.length > 0) {
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
}