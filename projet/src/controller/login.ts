import { Request, Response } from 'express'
import { Fonction } from '../fonction/fonction'
import { User } from '../modele/user/user'

export class Login {
	static async log(req: Request, res: Response) {
		const { username, password } = req.body
		const mode = username.length == 5 ? 'gpao' : 'ldap'
		// switch (mode) {
		// 	case 'ldap':
		// 		try {
		// 			const data: { user: User; token: string } =
		// 				await Fonction.login(username, password, mode)

		// 			res.cookie('token', data.token, {
		// 				httpOnly: true,
		// 				secure: false, // Disable HTTPS
		// 				sameSite: 'strict',
		// 				maxAge: 1000 * 60 * 60,
		// 			})

		// 			res.status(200).json({
		// 				message: 'Connexion réussie',
		// 				user: new User(
		// 					data.user.matricule,
		// 					data.user.fullname,
		// 					data.user.id_ligne,
		// 					data.user.ligne,
		// 					data.user.email
		// 				),
		// 			})
		// 		} catch (error) {
		// 			res.status(401).json({
		// 				message: 'Erreur lors de la connection ',
		// 				erreur: error,
		// 			})
		// 		}
		// 		break
		// 	case 'gpao':
		try {
			const data: { user: User; token: string } = await Fonction.login(
				username,
				password,
				mode
			)

			await Fonction.getCapacite(data.token)

			res.cookie('token', data.token, {
				httpOnly: true,
				secure: false, // Disable HTTPS
				sameSite: 'strict',
				maxAge: 1000 * 60 * 60,
			})

			res.status(200).json({
				message: 'Connexion réussie',
				user: new User(
					data.user.matricule,
					data.user.fullname,
					data.user.id_ligne,
					data.user.ligne,
					data.user.email
				),
			})
		} catch (error) {
			res.status(401).json({
				message: 'Erreur lors de la connection ',
				erreur: error,
			})
		}

		// 		break
		// 	default:
		// 		res.status(404).json({ message: 'Acces non autorisé !' })
		// 		break
		// }
	}

	static async logout(req: Request, res: Response) {
		res.clearCookie('token', {
			httpOnly: true,
			secure: false, // Must match the setting used when creating the cookie
			sameSite: 'strict', // Must match the setting used when creating the cookie
		})
		return res.status(200).json({ message: 'Logout successful' })
	}

	static async verifyToken(req: Request, res: Response) {
		const token = req.cookies?.token || null
		// const fonction = new Fonction()
		if (token) {
			const decoded = await Fonction.verifyToken(token)
			res.status(200).json({ user: decoded })
		} else {
			res.status(401).json({ message: 'Token manquant ou invalide' })
		}
	}

	static async verifyRole(req: Request, res: Response) {
		const token = req.cookies?.token || null
		const page = req.params.page || ''
		// const fonction = new Fonction()
		if (token) {
			try {
				const decoded: any = await Fonction.verifyToken(token)
				// res.status(200).json({ message: 'Role vérifié avec succès' });
				if (
					typeof decoded === 'object' &&
					decoded !== null &&
					'matricule' in decoded &&
					'fullname' in decoded &&
					'id_ligne' in decoded &&
					'ligne' in decoded &&
					'email' in decoded
				) {
					const user = new User(
						decoded.matricule,
						decoded.fullname,
						decoded.id_ligne,
						decoded.ligne,
						decoded.email
					)
					Fonction.verifyRole(user, page)
					res.status(200).json({
						message: 'Role vérifié avec succès',
					})
				} else {
					res.status(403).json({
						message: 'Token invalide ou mal formé',
						erreur: decoded,
					})
				}
			} catch (error) {
				res.status(403).json({
					message: 'Accès interdit',
					erreur: error,
				})
			}
		} else {
			res.status(401).json({ message: 'Token manquant ou invalide' })
		}
	}
}
