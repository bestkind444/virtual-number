import { prisma } from "../db/prisma.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import { createVirtualAccount } from "./paystack.controller.js";

//sign up
const registerUser = async (req, res) => {
    try {

        const { firstName, lastName, userName, email, password, confirmPassword } = req.body;
        console.log(req.body);


        if (!firstName || !lastName || !userName || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "password does not match"
            });
        }

        //check if user exist
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })
        if (existingUser) {
            return res.status(401).json({ success: false, message: "Email already registered" })
        }
        const hashedpassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                userName,
                email,
                password: hashedpassword
            }
        });

          // 🔹 Create Paystack Virtual Account
    // const virtualAcc = await createVirtualAccount(email, firstName, lastName);

    // 🔹 If Paystack creation was successful, update user record
    // if (virtualAcc.success) {
    //   await prisma.user.update({
    //     where: { id: newUser.id },
    //     data: {
    //       accountNumber: virtualAcc.account_number,
    //       bankName: virtualAcc.bank_name,
    //       bankCode: virtualAcc.bank_code,
    //       customerCode: virtualAcc.customer_code,
    //     },
    //   });
    // }

    
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userName: newUser.userName,
        email: newUser.email,
        
      },
    });

    } catch (error) {
            console.error(error);
            throw new Error(error);
            
    }



}
export { registerUser };

//login 
const loginUser = async (req, res) => {
    console.log(req.body);

    const { email, password, rememberMe } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "all filed are required"
            });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        const verifiedPass = await bcrypt.compare(password, user.password);
        if (!verifiedPass) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        const accesstokenExpiry = rememberMe ? "7d" : "2d";
        const refresherExpiry = "30d";

        const accessToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: accesstokenExpiry }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: refresherExpiry }
        )

        //insert refresher token to db
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await prisma.refresherToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt
            }
        });

        

        res.status(200).json({
            success: true,
            message: "login successfully",
            accessToken,
            refreshToken,
            data: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
                email: user.email
            }



        })




    } catch (error) {
         console.error("Login error:", error);
         return res.status(500).json({
            success: false,
            message: "server error"
         })
    }

}
export { loginUser }