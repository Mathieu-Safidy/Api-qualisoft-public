import axios from 'axios'
import jwt from 'jsonwebtoken'
import { User } from '../modele/user/user'
import { decode } from 'punycode'
import { Page } from '../modele/page/page'

export class Fonction {
	private static PUBLIC_KEY: string // = process.env.PUBLIC_KEY || ''


	static async loginGpao(
		username: string,
		password: string
	): Promise<{ user: User; token: string }> {
		const url = `${process.env.AUTH_API}/auth/gpao`
		// const options = {
		// 	method: 'POST',
		// 	url,
		// 	headers: { 'Content-Type': 'application/json' },
		// 	data: {
		// 		username: username,
		// 		password: password,
		// 	},
		// }
		try {
			// const response = await axios.request(options);
			console.log(url);
			const response = await axios.post(url, {
				username: username,
				password: password,
			})
			// const data: any = response.data
			// if (!data)
			const { status } = response

			if (status == 404) {
				throw new Error(
					'Utilisateur non trouver veuillez verifier vos informations'
				)
			}

			return response.data as any
		} catch (error:any) {
			console.log('Erreur lors de la connection ', error.message)
			throw error
		}
	}

	async verifyToken(token: string): Promise<any> {
		if (!Fonction.PUBLIC_KEY) {
            // Get public key from auth microservice
            const url = `${process.env.AUTH_API}/auth/public-key`
            const response = await axios.get(url)
            const key: string = response.data as string
            Fonction.PUBLIC_KEY = key
        }
        try {
			const decoded = jwt.verify(token, Fonction.PUBLIC_KEY, {
				algorithms: ['RS256'],
			})
			return decoded
		} catch (error) {
			console.log('Erreur lors de la verification du token ', error)
			throw error
		}
	}

	verifyRole(decoded: User, page: string) {
		try {
			const user = decoded.verify()
			// const page = Page.verify(page);
		} catch (error) {}
	}
}
