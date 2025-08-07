import axios from "axios";
import { Request, Response } from "express";

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
}