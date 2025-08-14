import axios from 'axios'
import jwt from 'jsonwebtoken'
import { User } from '../modele/user/user'
import { decode } from 'punycode'
import { Page } from '../modele/page/page'

export let roles: Record<string, number[]> = {}

export class Fonction {
	private static PUBLIC_KEY: string // = process.env.PUBLIC_KEY || ''

	static async login(
		username: string,
		password: string,
		mode: 'ldap' | 'gpao' = 'gpao'
	): Promise<{ user: User; token: string }> {
		const url = `${process.env.AUTH_API}/auth/${mode}`
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
			console.log(url)
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
		} catch (error: any) {
			console.log('Erreur lors de la connection ', error.message)
			throw error
		}
	}

	static async verifyToken(token: string): Promise<any> {
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

	static async getCapacite(token: string): Promise<number[]> {
		const decoded = await this.verifyToken(token)
		const { matricule } = decoded as User
		if (matricule in roles) {
			return roles[matricule]
		}
		const url = `${
			process.env.RBAC_API
		}/matricule/${matricule}?application=${
			(global as any).__app_name || 'qualisoft'
		}`
		const response = await axios.get(url)
		if (response.status == 200) {
			const {
				applications: [{ capacites }],
			} = response.data as any
			roles[matricule] = capacites as number[]
			console.log(roles)
			return capacites as number[]
		}
		throw new Error('Erreur lors de la recuperation des capacites')
	}

	static verifyRole(decoded: User, page: string) {
		try {
			const user = decoded.verify()
			// const page = Page.verify(page);
		} catch (error) {}
	}
}
