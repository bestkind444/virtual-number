// import { prisma } from "../db/prisma.js";
import paystack from "../utils/paystack.js";
      

/**
 * Create a Paystack virtual account for a user
 * @param {string} email - user's email
 * @param {string} firstName - user's first name
 * @param {string} lastName - user's last name
 */
export const createVirtualAccount = async (email, firstName, lastName) => {
  try {
    const response = await paystack.post("/dedicated_account", {
      customer: {
        email,
        first_name: firstName,
        last_name: lastName,
      },
      preferred_bank: "wema-bank", // You can also use "titan-paystack" etc.
    });

    return {
      success: true,
      account_number: response.data.data.account_number,
      bank_name: response.data.data.bank.name,
      bank_code: response.data.data.bank.code,
      customer_code: response.data.data.customer?.customer_code,
      account_id: response.data.data.id,
    };

  } catch (error) {
    console.error("Paystack Virtual Account Error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};
