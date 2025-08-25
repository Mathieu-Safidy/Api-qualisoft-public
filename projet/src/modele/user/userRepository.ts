import axios from "axios";

export class UserRepository {
    static async getAllUsers() {
        try {
            const result = await axios.get(`${process.env.RBAC_API}/users`);
            if (result.data) {
                return result.data;
            } else {
                throw new Error("No data found");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }
}
