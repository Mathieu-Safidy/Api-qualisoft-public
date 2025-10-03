import { pool } from "../database/db";

export class ChampParamRepository {
    static async findAll(): Promise<any> {
        try {
            const resutlt =  await pool!.query('SELECT * FROM champ_param_interne');
            return resutlt.rows;
        } catch (error) {
            throw error;
        }
    }

    // static async addParamExterne(idChampParamInterne: number, id_projet: number, onglet: string, ): Promise<void> {
    //     try {
            
    //     } catch (error) {
    //         throw error;
    //     }
    // }
}