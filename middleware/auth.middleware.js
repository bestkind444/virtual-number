import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "No token provided"
    })
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;

    } catch (error) {
      console.log(error);
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

  }


}
export { authMiddleware };

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  console.log(refreshToken);
  
  try {
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "no token provided"
      });
    }

    const istokenValid = await prisma.refresherToken.findUnique({
      where: { token: refreshToken }
    });

    if (!istokenValid || istokenValid.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        message: "no Invalid or expired refresh token provided"
      });
    }


    let payload;
    try {
      payload = await jwt.verify(refreshToken, process.env.JWT_SECRET);

    } catch (error) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = await jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const newRefreshToken = await jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET, { expiresIn: "30d" })

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.$transaction([
      prisma.refresherToken.delete({
        where: { token: refreshToken }
      }),
      prisma.refresherToken.create({
        data: { token: newRefreshToken, expiresAt }
      })
    ]);


    return res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });




  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "server error" });
    
  }


}
export { refreshToken };  
