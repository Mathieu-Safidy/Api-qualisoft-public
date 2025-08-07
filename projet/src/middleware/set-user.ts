import { Request, Response } from "express";
import { Login } from "../controller/login";
import { Fonction } from "../fonction/fonction";

export default async function (req: Request, res: Response, next: any) {
     try {
          const token = req.cookies?.token
          console.log('Token:', token);
          const fonction = new Fonction()
          const decoded = await fonction.verifyToken(token);
          (req as any).user = decoded
          console.log('Decoded user:', decoded);
          next()
     }
     catch {
          res.status(400).json({ message: 'Invalid token' })
     }
}