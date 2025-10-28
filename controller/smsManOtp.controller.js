import axios from "axios";
import { prisma } from "../db/prisma.js";
import { calculatePrice } from "../utils/profit.js";


const API_KEY = process.env.SMS_MAN_OTP;


//get wallet balance
const getBalance = async (req, res) => {
    const [balance, currency] = await Promise.all([
        axios.get(`https://api.sms-man.com/control/get-balance?token=${API_KEY}`),

        axios.get("https://open.er-api.com/v6/latest/RUB")
    ]);

    // console.log(response.data);
    // const smsPrices = priceResponse.data
    const rubToNgn = currency.data.rates.NGN;
    const myBalance = parseFloat(balance.data.balance);
    const convertedBalanceToNaira = (rubToNgn * myBalance).toFixed(2)

    return res.json(convertedBalanceToNaira);
}
export { getBalance };


//get all countries
const getCountries = async (req, res) => {
    try {
        const response = await axios.get(`https://api.sms-man.com/control/countries?token=${API_KEY}`);
        console.log(response.data);
        res.json(response.data);


    } catch (error) {
        console.error("Error fetching countries:", err.message);
        res.status(500).json({ error: "Failed to fetch countries" });
    }

}
export { getCountries };


//get all services 
const getService = async (req, res) => {
    try {
        const response = await axios.get(`https://api.sms-man.com/control/applications?token=${API_KEY}`);
        console.log(response.data);

        res.json(response.data);

    } catch (error) {
        console.error("Error fetching countries:", err.message);
        res.status(500).json({ error: "Failed to fetch countries" });
    }

}
export { getService };

//get current price
const getCurrentPrice = async (req, res) => {
    const { country, application } = req.body;
    const userId = req.userId;
    // console.log(userId);
    if (!country) {
        return res.status(400).json({ success: false, message: "invalid country" });
    }

    try {
        const [priceResponse, currency] = await Promise.all([
            axios.get(`https://api.sms-man.com/control/get-prices?token=${API_KEY}&country_id=${country}`),
            axios.get("https://open.er-api.com/v6/latest/RUB")
        ]);

        const smsPrices = priceResponse.data;
        const rubToNgn = currency.data.rates.NGN;
        const profit = 0.1;
        let found = null;

        for (const key in smsPrices) {
            const item = smsPrices[key];
            const rubCost = parseFloat(item.cost);
            const costNaira = rubCost * rubToNgn * (1 + profit);
            item.cost = costNaira.toFixed(2);

            if (application && item.application_id == application) {
                found = item;
                break;
            }
        }

        return res.json({
            success: true,
            data: application ? found : smsPrices,
        });

    } catch (error) {
        console.error("Error fetching prices:", error.message);
        res.status(500).json({ error: "Failed to fetch prices" });
    }
};
export { getCurrentPrice };




//get Phone number 
const getNumber = async (req, res) => {
    const { country, application } = req.body;
    const userId = req.userId;
    console.log(userId);

    if (!country || !application) {
        return res.status(400).json({
            success: false,
            message: "Country or application missing",
        });
    }

    try {
        // requesting  user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Get price from API
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

        // user has enough balance?
        if (user.balance < servicePrice) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance",
                required: servicePrice,
            });
        }

        //  Check number availability
        const limitRes = await axios.get("https://api.sms-man.com/control/limits", {
            params: {
                token: API_KEY,
                country_id: country,
                application_id: application,
            },
        });

        const limitDataObj = limitRes.data;
        const limitData = Object.values(limitDataObj);;
        const available = limitData.find( (item) =>
            parseInt(item.application_id) === parseInt(application) &&
            parseInt(item.country_id) === parseInt(country)
        );


        if (!available || parseInt(available.numbers) <= 0) {
            return res.status(400).json({
                success: false,
                message: "No numbers available for this country/app",
            });
        }

        // Get number
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
        console.log(numberData);
        

        // Deduct user balance
        const newBalance = user.balance - servicePrice;

        await prisma.user.update({
            where: { id: userId },
            data: { balance: newBalance },
        });

        //  Fetch SMS request
        const smsRes = await axios.get("https://api.sms-man.com/control/get-sms", {
            params: {
                token: API_KEY,
                request_id: numberData.request_id,
            },
        });

        const smsData = smsRes.data.sms_code;

        // res
        return res.status(200).json({
            success: true,
            message: "Number successfully acquired and SMS fetched",
            number: numberData.number,
            sms: smsData,
            servicePrice
        });

    } catch (error) {
        console.error("Error fetching number:", error.response?.data || error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting number",
        });
    }
}

export { getNumber };





