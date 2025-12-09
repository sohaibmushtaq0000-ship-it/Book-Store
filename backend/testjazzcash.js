const axios = require("axios");
require("dotenv").config();
const qs = require("qs");

async function testJazzCashCallback() {
  const callbackUrl = `${process.env.BASE_URL}/api/payments/return`;

  // IMPORTANT:
  // - pp_TxnRefNo must NOT start with "TXN"
  // - mpf fields must NOT contain phone numbers or sensitive numbers
  // You must use SAFE test values for callback testing.

  const testPayload = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: "MC490133",
    pp_Password: "vgazv0x42s",

    // FIX: TxnRefNo must NOT start with TXN (JazzCash rejects it)
    pp_TxnRefNo: "MC176526188571654",

    pp_Amount: "50000",
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: "20251206093314",
    pp_BillReference: "BOOK500",
    pp_Description: "Book Purchase - PKR 500",
    pp_ReturnURL: "https://690ff270dee2.ngrok-free.app/api/payments/return",

    // Replace with actual secure hash you generated for the above fields
    pp_SecureHash: "6A44FDCBF5B6454126CE78C29512CF2C1B1DB551B29A3B7609FBD162213A1A9C",

    // FIX: mpf fields must NOT contain phone numbers or long numeric fields
    ppmpf_1: "BOOK1",
    ppmpf_2: "USER1",
    ppmpf_3: "SELLER1",
    ppmpf_4: "50000",
    ppmpf_5: "1"
  };

  try {
    console.log("📡 Sending Test JazzCash Callback...");
    console.log("👉 URL:", callbackUrl);

    const response = await axios.post(callbackUrl, qs.stringify(testPayload), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    console.log("\n🎉 JazzCash Callback Response from YOUR Server:");
    console.log(response.data);

  } catch (error) {
    console.error("\n❌ ERROR while testing callback:");
    console.error(error.response?.data || error.message);
  }
}

testJazzCashCallback();
