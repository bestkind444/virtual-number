import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import twilio from "twilio";

const app = express();

// Load environment variables
dotenv.config();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/q5/", authRoutes);



// const accountSid = process.env.ACCOUNT_SID;
// const authToken = process.env.AUTH_TOKEN;
// const client = twilio(accountSid, authToken);

// Send a WhatsApp message (test)
// client.messages
//   .create({
//     from: "whatsapp:+14155238886",
//     contentSid: "HXb5b62575e6e4ff6129ad7c8efe1f983e", 
//     contentVariables: '{"1":"12/1","2":"3pm"}',      
//     to: "whatsapp:+2347019855552",
//      statusCallback: 'https://virtual-number.onrender.com/webhook/whatsapp'
//   })
//   .then((message) => console.log("Message SID:", message.sid))
//   .catch((err) => console.error("Error:", err));

// Incoming WhatsApp messages (when user replies)
// app.post("/webhook/whatsapp", (req, res) => {
//   console.log("📩 Incoming webhook hit!");
//   console.log("Headers:", req.headers);
//   console.log("Body:", req.body);

//   const from = req.body.From;
//   const body = req.body.Body;

//   if (from && body) {
//     console.log(`Message from ${from}: ${body}`);
//   } else {
//     console.log("⚠️ No From/Body in request");
//   }

//   res.set("Content-Type", "text/xml");
//   res.send(`
//     <Response>
//       <Message>You said: ${body || "nothing"} </Message>
//     </Response>
//   `);
// });


// Delivery status updates
// app.post("/status/whatsapp", (req, res) => {
//   const messageStatus = req.body.MessageStatus;
//   const messageSid = req.body.MessageSid;



//   console.log(`Message SID ${messageSid} status: ${messageStatus}`);
//   res.sendStatus(200);
// });



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});
