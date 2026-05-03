import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import helmet from "helmet";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  globalLimiter,
  authLimiter,
  lockdownGuard,
  ipBlockGuard,
  signalTracker,
} from "./middleware/security";
import { startThreatEngine } from "./lib/threat-engine";

const app: Express = express();

// ── Security headers ────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ── Logging ─────────────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

// ── CORS — only allow same-domain origins ───────────────────────────────────
const allowedOrigins = (process.env.REPLIT_DOMAINS ?? "")
  .split(",")
  .map((d) => d.trim())
  .filter(Boolean)
  .flatMap((d) => [`https://${d}`, `http://${d}`]);

app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      if (process.env.NODE_ENV !== "production" && /localhost|127\.0\.0\.1/.test(origin)) {
        return cb(null, true);
      }
      cb(new Error("Not allowed by CORS"));
    },
  })
);

// ── Body limits ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── Session ─────────────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "quantum-lounge-secret",
    resave: false,
    saveUninitialized: false,
    name: "ql.sid",
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

// ── Rate limiting ───────────────────────────────────────────────────────────
app.use("/api", globalLimiter);
app.use("/api/auth/login", authLimiter);

// ── Signal tracking (records request patterns for threat engine) ────────────
app.use(signalTracker);

// ── IP block guard (blocks flagged IPs) ────────────────────────────────────
app.use(ipBlockGuard);

// ── Lockdown guard (full system lockdown check) ────────────────────────────
app.use(lockdownGuard);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", router);

// ── Sanitised error handler ──────────────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  req.log?.error({ err }, "Unhandled error");
  const status = (err as any).status ?? 500;
  const message = isProduction ? "Internal server error" : (err.message ?? "Unknown error");
  res.status(status).json({ error: message });
});

// ── Start threat detection engine ────────────────────────────────────────────
startThreatEngine();

export default app;
