import { Router } from "express";
import { catchAsync, setUserMiddleware } from "../controller/tets";
import { MigrationController } from "../controller/MigrationController";

const router = Router();
router.use(setUserMiddleware);


export default router;