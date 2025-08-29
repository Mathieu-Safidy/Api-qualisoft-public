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

const router = Router()

router.use(setUserMiddleware)
// router.use()

// router.get('/parametrage', setUserMiddleware, capacityMiddleware(4), async (req: any, res: any) => {
//     return res.status(200).json({ message: 'Paramétrage reçu' })
// })

router.post('/update', catchAsync(ParametrageController.update))

router.get('/users', catchAsync(UserController.getAllUsers))

router.post('/parametrage', catchAsync(ParametrageController.create))

router.get('/erreurs', catchAsync(ErreurController.getErreurSuggestions))

router.post('/filtres', catchAsync(VueActiviteController.getByFilter))

router.get('/typeTraitements', catchAsync(TypeTraitementController.getAllTypeTraitements))

router.get('/operations', catchAsync(OperationController.getAllOperations))

router.get('/unites', catchAsync(UniteController.getUnites))

router.get('/unites/:id_unite', catchAsync(UniteController.getUnitesById))

router.get('/projets' , catchAsync(ProjetController.getAll))

router.get('/client/:id' , catchAsync(ClientController.getById))

router.post('/duplicate', catchAsync(ProjetController.duplicateErrorType))

router.get('/verifier/plan/:plan/fonction/:fonction', catchAsync(ProjetController.verifClone))

router.get('/verifier/ligne/:ligne/plan/:plan/fonction/:fonction', catchAsync(ProjetController.verif))


export default router