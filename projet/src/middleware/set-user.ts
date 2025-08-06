import { Request, Response } from "express";
import { Login } from "../controller/login";
import { Fonction } from "../fonction/fonction";

export default async function (req: Request, res: Response, next: any) {
     try {
          const token = req.cookies?.token
          const fonction = new Fonction()
          const decoded = await fonction.verifyToken(token);
          (req as any).user = decoded
          next()
     }
     catch {
          res.status(400).json({ message: 'Invalid token' })
     }
}