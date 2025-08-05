import { Request, Response, Router } from 'express'
import { capacityMiddleware, catchAsync, setUserMiddleware, withCapacity } from '../controller/tets'
import { ErreurRepository } from '../modele/erreur/ErreurRepository'
import { ErreurController } from '../controller/ErreurController'

const router = Router()

// router.use()

router.get('/parametrage', setUserMiddleware, capacityMiddleware(4), async (req: any, res: any) => {
    return res.status(200).json({ message: 'Paramétrage reçu' })
})

router.get('/erreur', (ErreurController.getErreurSuggestions))

export default router