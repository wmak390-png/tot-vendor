import { Router, type IRouter } from "express";
import healthRouter from "./health";
import vendorRouter from "./vendor";

const router: IRouter = Router();

router.use(healthRouter);
router.use(vendorRouter);

export default router;
