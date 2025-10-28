import axios from "axios";
const API_KEY = process.env.SMSMAN_API_KEY;

export async function calculatePrice(country, application) {
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


  return application ? found : smsPrices;
}
