import { Router } from "express";
import { getCountries, getService, getCurrentPrice, getBalance, getNumber } from "../controller/smsManOtp.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const smsManRouter = Router();


smsManRouter.get("/all/countries", getCountries);
smsManRouter.get("/all/service", getService);
smsManRouter.post("/all/price", authMiddleware, getCurrentPrice);
smsManRouter.get("/all/balance", getBalance);
smsManRouter.post("/all/num", authMiddleware, getNumber);



export default smsManRouter;