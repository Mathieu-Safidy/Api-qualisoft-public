import cors from 'cors'
import express, { Request, Response } from 'express'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import { Login } from './controller/login'
import { Fonction } from './fonction/fonction'
import cookieParser from 'cookie-parser'
// import { setRouteCapacity, setUserMiddleware } from "./controller/tets";
import parametrageRouter from './router/parametrage'
import * as dotenv from 'dotenv'
import { initDb } from './modele/database/db'
import { catchAsync } from './controller/tets'
import migration from './router/migration'
import { link } from 'fs'

// Setup environment
dotenv.config()
initDb()

;(global as any).__app_name = process.env.APP_NAME || 'qualisoft'

const routerPrincipal: Record<
	string,
	(req: Request, res: Response) => Promise<void>
> = {
	login: Login.log,
}

const swaggerSpec = YAML.load(path.join(__dirname, '../swagger.yaml'))

const app = express()

app.use(cors({ credentials: true, origin: 'http://localhost:4200' }))
app.use(cookieParser())
const port = 5000

app.use(express.json({}))

// Swagger docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/', (req: Request, res: Response) => {
	res.send('API is running')
})

// verify role
app.get('/verify/:page', catchAsync(Login.verifyRole))

// Verify token route
app.get('/verify', Login.verifyToken)

app.post('/api/login', Login.log)
app.get('/api/logout', Login.logout)
// app.use('/api/migrate', migration)
app.use('/api', parametrageRouter)

app.listen(port, () => {
	console.log(`Serveur lancé sur http://localhost:${port}`)
})
