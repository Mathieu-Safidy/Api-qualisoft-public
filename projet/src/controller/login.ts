import { Request, Response } from "express";
import { Fonction } from "../fonction/fonction";
import { User } from "../modele/user/user";

export class Login {
    static async log(req: Request, res: Response) {
        const { username, password, mode } = req.body;
        switch (mode) {
            case 'ldap':

                break;
            case 'gpao':
                try {
                    const data: { user: User; token: string } = await Fonction.loginGpao(username, password);

                    res.cookie('token', data.token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'strict',
                        maxAge: 1000 * 60 * 60
                    });

                    res.status(200).json({
                        message: 'Connexion réussie',
                        user: new User(
                            data.user.matricule,
                            data.user.fullname,
                            data.user.id_ligne,
                            data.user.ligne,
                            data.user.email
                        ),
                    });

                } catch (error) {
                    res.status(401).json({ message: 'Erreur lors de la connection ', erreur: error })
                }

                break;
            default:
                res.status(404).json({ message: 'Acces non autorisé !' });
                break;
        }
    }

    static verifyToken(req: Request, res: Response) {
        const token = req.cookies?.token || null;
        const fonction = new Fonction();
        if (token) {
            const decoded = fonction.verifyToken(token);
            res.status(200).json({ user: decoded });
        } else {
            res.status(401).json({ message: 'Token manquant ou invalide' });
        }
    }

    static verifyRole(req: Request, res: Response) {
        const token = req.cookies?.token || null;
        const page = req.params.page || '';
        const fonction = new Fonction();
        if (token) {
            try {
                const decoded = fonction.verifyToken(token);
                res.status(200).json({ message: 'Role vérifié avec succès' }); 
                if (typeof decoded === 'object' && decoded !== null &&
                    'matricule' in decoded && 'fullname' in decoded &&
                    'id_ligne' in decoded && 'ligne' in decoded && 'email' in decoded) {
                    const user = new User(
                        decoded.matricule,
                        decoded.fullname,
                        decoded.id_ligne,
                        decoded.ligne,
                        decoded.email
                    );
                    fonction.verifyRole(user,page);
                    res.status(200).json({ message: 'Role vérifié avec succès' });
                } else {
                    res.status(403).json({ message: 'Token invalide ou mal formé', erreur: decoded });
                }
            } catch (error) {
                res.status(403).json({ message: 'Accès interdit', erreur: error });
            }
        } else {
            res.status(401).json({ message: 'Token manquant ou invalide' });
        }
    }

}