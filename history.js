import axios from "axios";
import prisma from "../db/prisma.js";

const API_KEY = process.env.SMSMAN_API_KEY;

export const getNumber = async (req, res) => {
  const { country, application } = req.body;
  const userId = req.userId;

  if (!country || !application) {
    return res.status(400).json({
      success: false,
      message: "Country or application missing",
    });
  }

  try {
    // 1️⃣ Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2️⃣ Get price from API (same logic as getCurrentPrice)
    const [priceResponse, currency] = await Promise.all([
      axios.get(`https://api.sms-man.com/control/get-prices?token=${API_KEY}&country_id=${country}`),
      axios.get("https://open.er-api.com/v6/latest/RUB")
    ]);

    const smsPrices = priceResponse.data;
    const rubToNgn = currency.data.rates.NGN;
    const profit = 0.1;
    let servicePrice = null;

    for (const key in smsPrices) {
      const item = smsPrices[key];
      if (item.application_id == application) {
        const rubCost = parseFloat(item.cost);
        const costNaira = rubCost * rubToNgn * (1 + profit);
        servicePrice = parseFloat(costNaira.toFixed(2));
        break;
      }
    }

    if (!servicePrice) {
      return res.status(400).json({
        success: false,
        message: "Price not found for this service",
      });
    }

    // 3️⃣ Check if user has enough balance
    if (user.balance < servicePrice) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
        currentBalance: user.balance,
        required: servicePrice,
      });
    }

    // 4️⃣ Check number availability
    const limitRes = await axios.get("https://api.sms-man.com/control/limits", {
      params: {
        token: API_KEY,
        country,
        application_id: application,
      },
    });

    const limitData = limitRes.data;
    const available = limitData.find(
      (item) =>
        item.application_id == application && item.country_id == country
    );

    if (!available || parseInt(available.numbers) <= 0) {
      return res.status(400).json({
        success: false,
        message: "No numbers available for this country/app",
      });
    }

    // 5️⃣ Get number
    const numberRes = await axios.get(
      `https://api.sms-man.com/control/get-number`,
      {
        params: {
          token: API_KEY,
          country_id: country,
          application_id: application,
        },
      }
    );

    const numberData = numberRes.data;

    // 6️⃣ Deduct user balance
    const newBalance = user.balance - servicePrice;

    await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    // 7️⃣ Return success
    return res.status(200).json({
      success: true,
      message: "Number successfully acquired",
      number: numberData.number,
      request_id: numberData.request_id,
      servicePrice,
      previousBalance: user.balance,
      newBalance,
    });
  } catch (error) {
    console.error("Error fetching number:", error.response?.data || error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while getting number",
    });
  }
};



//testing data
    const mockNumberData = {
            request_id: 123456,
            country_id: parseInt(country),
            application_id: parseInt(application),
            number: "+1234567890"
        };