import { Router } from "express";
import { getCountries } from "../controller/bendOtp.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const bendOtpRouter = Router();


bendOtpRouter.get("/all/coutries", getCountries);



export default bendOtpRouter;