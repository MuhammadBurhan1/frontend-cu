import { Router } from "express";
import { getOTP, verifyOTP } from "../controllers/otp.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {otpLimit} from "../utils/rateLimiting.js"

const router = Router();

router.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
});

// OTP routes
router.get("/otp", otpLimit, getOTP);  // GET /verify/otp with method=email
router.post("/otp", verifyOTP);        // POST /verify/otp with otp in body

export default router;
