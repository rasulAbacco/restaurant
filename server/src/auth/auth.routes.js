// ==============================================
// src/auth/auth.routes.js
// ==============================================

import { Router } from "express";
import {
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  updateProfileHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  changePasswordHandler,
} from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";
import { validate } from "../middleware/validate.js";
import {
  loginRateLimiter,
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter,
} from "../middleware/rateLimiters.js";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "./auth.validation.js";

const router = Router();

// Public — rate limiting + validation added; previously had neither.
router.post("/login", loginRateLimiter, validate(loginSchema), loginHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);
router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  validate(forgotPasswordSchema),
  forgotPasswordHandler,
);
router.post(
  "/reset-password",
  resetPasswordRateLimiter,
  validate(resetPasswordSchema),
  resetPasswordHandler,
);

// Protected
router.get("/me", requireAuth, meHandler);
router.put(
  "/me",
  requireAuth,
  validate(updateProfileSchema),
  updateProfileHandler,
);
router.post(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  changePasswordHandler,
);

export default router;
