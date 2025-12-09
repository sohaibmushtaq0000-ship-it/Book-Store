// services/payment.service.js
const JazzCashService = require('./jazzcash.service');
const crypto = require('crypto');

const createJazzCashPayment = (amount, userId, bookId = null, sellerId = null) => {
  const returnUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/payments/return`;
  // Pass sellerId as well so jazzcash service can build ppmpf fields if needed
  return JazzCashService.createPaymentRequest(amount, userId, bookId, sellerId, returnUrl);
};

const hashToNumeric = (id) => {
  if (!id) return '0';
  const hash = crypto.createHash('md5').update(id.toString()).digest('hex');
  return parseInt(hash.substring(0, 8), 16) || 0;
};

const createPaymentWithCommission = async (amount, userId, bookId, sellerId, sellerType) => {
  const SUPERADMIN_COMMISSION = parseInt(process.env.SUPERADMIN_COMMISSION_PERCENTAGE, 10) || 10;
  
  let sellerAmount = Number(amount) || 0;
  let superadminAmount = 0;
  
  if (sellerType === "admin") {
    superadminAmount = Math.floor((sellerAmount * SUPERADMIN_COMMISSION) / 100);
    sellerAmount = sellerAmount - superadminAmount;
  } else if (sellerType === "superadmin") {
    superadminAmount = sellerAmount;
    sellerAmount = 0;
  }

  // Prepare ppmpf fields (pass prefixed string values to avoid JazzCash rejections)
  const extraFields = {
    ppmpf_1: `B${hashToNumeric(bookId)}`,
    ppmpf_2: `U${hashToNumeric(userId)}`,
    ppmpf_3: `S${hashToNumeric(sellerId)}`,
    // ppmpf_4 must be amount in paisa
    ppmpf_4: String(Math.round(Number(amount) * 100)),
    ppmpf_5: '1'
  };

  const returnUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/payments/return`;

  // Call JazzCashService with the correct argument order
  const { paymentData, paymentURL, transactionRef } = JazzCashService.createPaymentRequest(
    amount,
    userId,
    bookId,
    sellerId,
    returnUrl,
    extraFields
  );

  // PaymentData already contains pp_SecureHash and pp_* fields as strings
  return {
    paymentURL,
    paymentData,
    transactionRef,
    commission: {
      sellerAmount,
      superadminAmount,
      commissionPercentage: SUPERADMIN_COMMISSION
    }
  };
};

const verifyJazzCashResponse = (responseData) => {
  return JazzCashService.verifyCallback(responseData);
};

module.exports = {
  createJazzCashPayment,
  createPaymentWithCommission,
  verifyJazzCashResponse
};
