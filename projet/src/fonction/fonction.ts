import axios from "axios";
import * as dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { User } from "../modele/user/user";
import { decode } from "punycode";
import { Page } from "../modele/page/page";

dotenv.config();

export class Fonction {

    private static PUBLIC_KEY: string = process.env.PUBLIC_KEY || '';

    static async loginGpao(username: string, password: string): Promise<{ user: User; token: string }> {
        const options = {
            method: 'POST',
            url: process.env.GPAO_LINK || '',
            headers: { 'Content-Type': 'application/json' },
            data: {
                username: username,
                password: password
            }
        };
        try {
            const response = await axios.request(options);
            const data: any = response.data;
            if (!data) throw new Error('Utilisateur non trouver veuillez verifier vos informations');

            return data;
        } catch (error) {
            console.log('Erreur lors de la connection ', error);
            throw error;
        }
    }

    verifyToken(token: string) {
        try {
            const decoded = jwt.verify(token, Fonction.PUBLIC_KEY, { algorithms: ['RS256'] });
            return decoded;
        } catch (error) {
            console.log('Erreur lors de la verification du token ', error);
            throw error;
        }
    }

    verifyRole(decoded: User, page: string) {
        try {
            const user = decoded.verify();
            // const page = Page.verify(page);

        } catch (error) {

        }
    }
}