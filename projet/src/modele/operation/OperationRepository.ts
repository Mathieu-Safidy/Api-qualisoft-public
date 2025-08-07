import axios from "axios";

export class OperationRepository {
    static async getAllOperations(): Promise<any> {
        try {
            const result = await axios.get(`${process.env.GPAO_API}/operations`);
            return result.data;
        } catch (error) {
            console.error('Error fetching operations:', error);
            throw error;
        }
    }
}