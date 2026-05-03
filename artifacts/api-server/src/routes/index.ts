import { Router, type IRouter } from "express";
import healthRouter from "./health";
import classifyRouter from "./classify";
import workoutsRouter from "./workouts";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(classifyRouter);
router.use(workoutsRouter);
router.use(profileRouter);

export default router;
