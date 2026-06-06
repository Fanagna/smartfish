import { Router } from "express";
import { authRouter } from "../modules/auth/auth.controller";
import { fishermenRouter } from "../modules/fishermen/fishermen.controller";
import { boatsRouter } from "../modules/boats/boats.controller";
import { catchesRouter } from "../modules/catches/catches.controller";
import { stockRouter } from "../modules/stock/stock.controller";
import { salesRouter } from "../modules/sales/sales.controller";
import { analyticsRouter } from "../modules/analytics/analytics.controller";
import { aiRouter } from "../modules/ai/ai.controller";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
apiRouter.use("/auth", authRouter);
apiRouter.use("/fishermen", fishermenRouter);
apiRouter.use("/boats", boatsRouter);
apiRouter.use("/catches", catchesRouter);
apiRouter.use("/stock", stockRouter);
apiRouter.use("/sales", salesRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/ai", aiRouter);
