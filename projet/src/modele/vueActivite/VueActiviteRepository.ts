import axios from "axios";

export class VueActiviteRepository {
    async filterActivities(ligne?: string, plan?: string, fonction?: string): Promise<any> {
        try {
            const data = { ligne, plan, fonction };
            const result = await axios.post(`${process.env.GPAO_API}/filtre`, data);
            return result.data;
        } catch (error) {
            console.error("Error filtering activities:", error);
            throw new Error("Erreur lors de la récupération des activités");
        }

    }
}