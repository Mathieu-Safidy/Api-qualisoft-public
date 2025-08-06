import { Request, Response, Router } from 'express'
import { capacityMiddleware, catchAsync, withCapacity } from '../controller/tets'
import { ErreurRepository } from '../modele/erreur/ErreurRepository'
import { ErreurController } from '../controller/ErreurController'
import setUserMiddleware from '../middleware/set-user'

const router = Router()

router.use(setUserMiddleware)
// router.use()

router.get('/parametrage', async (req: any, res: any) => {
    return res.status(200).json({ message: 'Paramétrage reçu' })
})

router.get('/erreur', (ErreurController.getErreurSuggestions))

export default router