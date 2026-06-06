import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schema";
import { authService } from "./auth.service";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await authService.register(req.body));
}));

authRouter.post("/login", validate(loginSchema), asyncHandler(async (req, res) => {
  res.json(await authService.login(req.body.email, req.body.password));
}));

authRouter.post("/refresh-token", validate(refreshSchema), asyncHandler(async (req, res) => {
  res.json(await authService.refresh(req.body.refreshToken));
}));

authRouter.post("/logout", asyncHandler(async (req, res) => {
  await authService.logout(req.body?.refreshToken);
  res.json({ success: true });
}));

authRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  res.json(await authService.me(req.user!.sub));
}));
