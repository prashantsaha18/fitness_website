import { Router, type IRouter } from "express";
import healthRouter from "./health";
import classifyRouter from "./classify";
import workoutsRouter from "./workouts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(classifyRouter);
router.use(workoutsRouter);

export default router;
