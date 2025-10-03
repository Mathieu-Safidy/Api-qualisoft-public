import { Request, Response, Router } from 'express'
import { capacityMiddleware, catchAsync, setUserMiddleware, withCapacity } from '../controller/tets'
import { ErreurRepository } from '../modele/erreur/ErreurRepository'
import { ErreurController } from '../controller/ErreurController'
import { VueActivite } from '../modele/vueActivite/VueActivite'
import { TypeTraitementController } from '../controller/TypeTraitementController'
import { VueActiviteController } from '../controller/VueActiviteController'
import { OperationController } from '../controller/OperationController'
import { UniteController } from '../controller/UniteController'
import { ProjetController } from '../controller/ProjetController'
import { ParametrageController } from '../controller/ParametrageController'
import { Client } from '../modele/client/Client'
import { ClientController } from '../controller/ClientController'
import { UserController } from '../controller/UserController'
import { MigrationController } from '../controller/MigrationController'
import multer from "multer";
import fs from "fs";
import { Projet } from '../modele/projet/Projet'
import { createProxyMiddleware } from "http-proxy-middleware";
import FormData from 'form-data';
import fetch from 'node-fetch'; 
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Définir le dossier de destination
//         const uploadDir = 'uploads/';
//         // Create the directory if it doesn't exist
//         if (!fs.existsSync(uploadDir)) {
//             fs.mkdirSync(uploadDir);
//         }
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         // Définir le nom du fichier
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });

const upload = multer();

const router = Router()

router.use(setUserMiddleware)
// router.use()

// router.get('/parametrage', setUserMiddleware, capacityMiddleware(4), async (req: any, res: any) => {
//     return res.status(200).json({ message: 'Paramétrage reçu' })
// })


router.post('/import/file', catchAsync(
        createProxyMiddleware(
            {
                target: `${process.env.IMPORT_API}` || '',
                changeOrigin: true,
                onProxyReq: (proxyReq: any, req:Request, res:Response) => {
                    // console.log('Proxying request to:', req.body);
                    
                } 
            } as any 
        )
    )
)
// router.post('/import/file', upload.single("file"), async (req, res) => {
//     try {
//         console.log("Requête reçue pour importation de fichier", req);
        
//          const response = await fetch(`${process.env.IMPORT_API}/import/file`, {
//             method: "POST",
//             body: req,       // flux brut, inchangé
//             headers: Object.fromEntries(
//                 Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v || ''])
//             )
//         });

//         const text = await response.text();
//         console.log("Réponse microservice brute:", text);
        

//         res.status(response.status).send(text);
        // req.file est géré par multer
        // if (req.file) {
        //     const formData = new FormData();
        //     formData.append("file", req.file.buffer, {
        //         filename: req.file.originalname,
        //         contentType: req.file.mimetype
        //     });

        //     // ajouter les autres champs
        //     Object.keys(req.body).forEach(key => {
        //         formData.append(key, req.body[key]);
        //     });

        //     formData.append("dbUrl", process.env.DATABASE_URL || "");
        //     const contentLength = await new Promise<string>((resolve, reject) => {
        //         formData.getLength((err, length) => {
        //             if (err) {
        //             console.error('Erreur calcul Content-Length:', err);
        //             return reject(err);
        //             }
        //             resolve(length.toString());
        //         });
        //     });
        //     const response = await fetch(`${process.env.IMPORT_API}/import/file`, {
        //         method: "POST",
        //         body: formData as any,
        //         headers: {...formData.getHeaders(),
        //             'Content-Length': contentLength
        //         }, // très important pour busboy
        //     });
            
        //     const raw = await response.text();
        //     console.log("Réponse microservice brute:", raw , 'header ', formData.getHeaders());

        //     if (!response.ok) {
        //         return res.status(response.status).send(raw);
        //     }

        //     // si JSON valide
        //     try {
        //         const json = JSON.parse(raw);
        //         return res.json(json);
        //     } catch {
        //         return res.send(raw);
        //     }
        // }
//     } catch (err) {
//         console.error("Erreur proxy:", err);
//         res.status(500).send("Erreur proxy");
//     }
// });

router.post('/import/data', catchAsync(MigrationController.importData))

router.post('/migre/column', catchAsync(MigrationController.getColonne))

router.post('/update', catchAsync(ParametrageController.update))

router.post('/delete', catchAsync(ParametrageController.delete))

router.post('/updateUnit', catchAsync(ParametrageController.updateOptional))

router.get('/users', catchAsync(UserController.getAllUsers))

router.post('/parametrage', catchAsync(ParametrageController.create))

router.get('/erreurs', catchAsync(ErreurController.getErreurSuggestions))

router.post('/filtres', catchAsync(VueActiviteController.getByFilter))

router.get('/typeTraitements', catchAsync(TypeTraitementController.getAllTypeTraitements))

router.get('/operations', catchAsync(OperationController.getAllOperations))

router.get('/operations/repartition', catchAsync(OperationController.getRepartitionTypeOperation))

router.get('/unites', catchAsync(UniteController.getUnites))

router.get('/unites/:id_unite', catchAsync(UniteController.getUnitesById))

router.get('/projets/parametrer', catchAsync(ProjetController.getProjetParametrer))

router.post('/projets/actif/parametrer', catchAsync(ProjetController.getProjetActifParametrer))

router.get('/projets/actif/:date_debut/to/:date_fin', catchAsync(ProjetController.getProjetActif))

router.get('/projets/actif/lignes/:date_debut/to/:date_fin', catchAsync(ProjetController.getProjetActifParLigne))

router.get('/projets/activite/periode', catchAsync(VueActiviteController.getAnneExcercice))

router.get('/projets/:annee', catchAsync(ProjetController.getProjetActifAnnuel))

router.get('/projets', catchAsync(ProjetController.getAll))

router.get('/client/:id', catchAsync(ClientController.getById))

router.post('/duplicate', catchAsync(ProjetController.duplicateErrorType))

router.get('/lignes/:ligne', catchAsync(ProjetController.getByLigne))

router.get('/verifier/param_externe/:id_projet', catchAsync(ProjetController.verifierExterne))

router.get('/verifier/plan/:plan/fonction/:fonction', catchAsync(ProjetController.verifClone))

router.get('/verifier/ligne/:ligne/plan/:plan/fonction/:fonction', catchAsync(ProjetController.verif))


export default router