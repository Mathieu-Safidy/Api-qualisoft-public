import { pool } from "../database/db";

export class User {

    // "user": {
    //     "ad": "asafidyherinirin",
    //     "matricule": "33381",
    //     "fullname": "Safidy Herinirina Arindranto Andriantsoa",
    //     "manager": {
    //         "ad": "landrianatoandro",
    //         "matricule": "00005",
    //         "fullname": "Barilalaina Joelisoa Andrianatoandro",
    //         "id_ligne": "289",
    //         "ligne": "DSI",
    //         "email": "landrianatoandro@jouve.com"
    //     },
    //     "id_ligne": "289",
    //     "ligne": "DSI",
    //     "email": "asafidyherinirin@jouve.com"
    // }

    matricule: string;
    fullname: string;
    id_ligne: string;
    ligne: string;
    email: string;
    capacite: number = 0;

    constructor(
        matricule: string,
        fullname: string,
        id_ligne: string,
        ligne: string,
        email: string
    ) {
        this.matricule = matricule;
        this.fullname = fullname;
        this.id_ligne = id_ligne;
        this.ligne = ligne;
        this.email = email;
    }

    set changeCapacite(compte : number) {
        this.capacite = compte;
    }

    async verify() {
        try {
            const result = await pool!.query("SELECT * FROM \"geo\".user WHERE matricule = $1", [this.matricule]);
            this.changeCapacite = result.rows[0].capacite as number;
            return this;
        } catch (error) {
            console.error('Erreur lors de la verification de l\'utilisateur', error);
        }
    }
}