import { pool } from "../database/db";

export class Page {
    id_link: number;
    capacite: number;
    libelle: string;

    constructor(idLink: number = 0, capacite:number = 0, libelle: string) {
        this.id_link = idLink;
        this.capacite = capacite;
        this.libelle = libelle;
    }

    static async verify (libelle: string) {
        try {
            const result = await pool.query('select * from "detail_projet".link where libelle = $1 ',[libelle]);
            const value = result.rows[0];
            return new Page(
                value.id_link,
                value.capacite,
                value.libelle
            );
        } catch (error) {
            console.error('Une erreur est survenu lors de la verification de la page',error);
            throw error;
        }
    } 
}