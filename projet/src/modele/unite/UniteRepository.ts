import axios from "axios";

export class UniteRepository {
    static async getAllUnites(): Promise<any> {
        try {
            const result = await axios.get(`${process.env.GPAO_API}/unite`);
            return result.data;
        } catch (error) {
            console.error('Error fetching unites:', error);
            throw error;
        }
    }
}