import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import roomsRouter from "./rooms";
import guestsRouter from "./guests";
import messagesRouter from "./messages";
import energyRouter from "./energy";
import teleportRouter from "./teleport";
import transactionsRouter from "./transactions";
import settingsRouter from "./settings";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/lounge/rooms", roomsRouter);
router.use("/guests", guestsRouter);
router.use("/messages", messagesRouter);
router.use("/energy", energyRouter);
router.use("/teleport", teleportRouter);
router.use("/transactions", transactionsRouter);
router.use("/settings", settingsRouter);
router.use("/stats", statsRouter);

export default router;
