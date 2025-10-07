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

router.post('/import/file', catchAsync(
        createProxyMiddleware(
            {
                target: `${process.env.IMPORT_API}` || '',
                changeOrigin: true
            } as any 
        )
    )
)


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

router.get('/type-erreurs/ligne/:ligne/plan/:plan/fonction/:fonction', catchAsync(ErreurController.getAllTypeErreurs))

router.get('/verifier/param_externe/:id_projet', catchAsync(ProjetController.verifierExterne))

router.get('/verifier/plan/:plan/fonction/:fonction', catchAsync(ProjetController.verifClone))

router.get('/verifier/ligne/:ligne/plan/:plan/fonction/:fonction', catchAsync(ProjetController.verif))


export default router