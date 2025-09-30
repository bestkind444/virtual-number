import express from "express";
import dotenv from  "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
const app = express();

dotenv.config()
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use("/api/q5/", authRoutes)

import twilio from 'twilio';

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid, authToken);

client.messages 
  .create({
    from: 'whatsapp:+14155238886',
    contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
    contentVariables: '{"1":"12/1","2":"3pm"}',
    to: 'whatsapp:+2347019855552'
  })
  .then(message => console.log("Message SID:", message.sid))
  .catch(err => console.error("Error:", err));






// Twilio webhook
app.post("/webhook/whatsapp", (req, res) => {
  const from = req.body.From; // who sent it
  const body = req.body.Body; // what they said

  console.log(`Message from ${from}: ${body}`);

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Message>Hey 👋! You said: ${body}</Message>
    </Response>
  `);
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>{
    console.log(`app running on port ${PORT}`);
    
})