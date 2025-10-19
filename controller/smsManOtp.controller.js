import axios from "axios";
import CurrencyConverter from "currency-converter-lt";
import { application } from "express";

const converter = new CurrencyConverter();

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
    if (!country || !application) {
        return res.status(400).json({
            success: false,
            message: "empty details"
        });
    }

    try {
        const reponse = await axios.get(`https://api.sms-man.com/control/get-number?token=${API_KEY}&country_id=${country}&application_id=${application}`)

        return res.json(reponse.data);

    } catch (error) {
        console.log(error);

    }

}
export { getNumber };





