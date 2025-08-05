import cors from "cors";
import express, { Request, Response } from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { Login } from "./controller/login";
import { Fonction } from "./fonction/fonction";
import cookieParser from "cookie-parser";
// import { setRouteCapacity, setUserMiddleware } from "./controller/tets";
import parametrageRouter from "./router/parametrage"

const routerPrincipal: Record<string, (req: Request, res: Response) => Promise<void>> = {
    login: Login.log,
    // "get-parametrage": ParametrageController.getParametrage
}

const swaggerSpec = YAML.load(path.join(__dirname, "../swagger.yaml"));

// const RBACAuth = JSON.parse(process.env.RBAC!)

/**
 * Exemple de JSON RBAC
 * {
 *  "get-parametrage": { capacity: 3, method },
 *  url2: { capacity1, handlerName2, method }
 * }
 */

const app = express();

// for (const url in RBACAuth) {
//     const { capacity, methode }: { capacity: number, methode: 'get'|'post'|'put'|'patch'|'delete' } = RBACAuth[url] as any
//     (app as any)[methode](url, async (req: any, res: any ,  next: any ) => await setUserMiddleware(req,res,next), async (req: any, res: any) => await setRouteCapacity(routerPrincipal[url], req, res, capacity))
// }

app.use(cors());
app.use(cookieParser());
const port = 5000;

app.use(express.json());


// Swagger docs route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get("/", (req: Request, res: Response) => {
    res.send("API is running");
});

// Swagger de login
app.post("/login", Login.log);

// verify role
app.get("/verify/:page", Login.verifyRole)


// Verify token route
app.get("/verify", Login.verifyToken)

app.use("/api", parametrageRouter)

app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`);
});