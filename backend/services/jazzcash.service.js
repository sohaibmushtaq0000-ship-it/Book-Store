// services/jazzcash.service.js
const crypto = require('crypto');
const axios = require('axios');

const DEFAULT_BASE_PROD = 'https://payments.jazzcash.com.pk';
const DEFAULT_BASE_SANDBOX = 'https://sandbox.jazzcash.com.pk';

class JazzCashService {
  constructor() {
    this.config = {
      merchantId: process.env.JAZZCASH_MERCHANT_ID,
      password: process.env.JAZZCASH_PASSWORD,
      salt: process.env.JAZZCASH_SALT || process.env.JAZZCASH_INTEGRITY_SALT,
      baseUrl: process.env.NODE_ENV === 'production' ? DEFAULT_BASE_PROD : DEFAULT_BASE_SANDBOX
    };
  }

  // Utility: create a short numeric-ish value from an id, but return as string prefixed (avoid pure numeric)
  static hashToNumericPrefixed(id, prefix = 'X') {
    if (!id) return `${prefix}0`;
    const hash = crypto.createHash('md5').update(id.toString()).digest('hex');
    const num = parseInt(hash.substring(0, 8), 16) || 0;
    // Prefix with a letter to avoid JazzCash rejecting pure-numeric or CNIC-like values
    return `${prefix}${num}`;
  }

  /**
   * Create payment request payload.
   * amount  - amount in PKR (number or numeric string). We'll convert to paisa internally.
   * userId, bookId, sellerId - for ppmpf fields
   * returnUrl - redirect URL after payment
   * extraFields - optional object to override ppmpf_1..ppmpf_5 etc.
   */
  createPaymentRequest(amount, userId, bookId, sellerId, returnUrl, extraFields = {}) {
    // Normalize amount and convert to paisa
    const amountNum = Number(amount) || 0;
    const amountInPaisa = Math.round(amountNum * 100); // e.g. 500.00 => 50000
    const amountString = amountInPaisa.toString();

    const transactionRef = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const dateTime = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14); // YYYYMMDDhhmmss

    // Build safe ppmpf_* values (prefixing to avoid numeric-only rejections)
    const ppmpf_1 = (extraFields.ppmpf_1 !== undefined)
      ? String(extraFields.ppmpf_1)
      : JazzCashService.hashToNumericPrefixed(bookId || 'book', 'B');

    const ppmpf_2 = (extraFields.ppmpf_2 !== undefined)
      ? String(extraFields.ppmpf_2)
      : JazzCashService.hashToNumericPrefixed(userId || 'user', 'U');

    const ppmpf_3 = (extraFields.ppmpf_3 !== undefined)
      ? String(extraFields.ppmpf_3)
      : JazzCashService.hashToNumericPrefixed(sellerId || 'seller', 'S');

    const ppmpf_4 = (extraFields.ppmpf_4 !== undefined)
      ? String(extraFields.ppmpf_4)
      : amountString;

    const ppmpf_5 = (extraFields.ppmpf_5 !== undefined)
      ? String(extraFields.ppmpf_5)
      : '1';

    // Build integrity string in the documented order (your previous order)
    const integrityString =
      '1.1' + '&' + // pp_Version
      'MWALLET' + '&' + // pp_TxnType
      'EN' + '&' + // pp_Language
      this.config.merchantId + '&' + // pp_MerchantID
      this.config.password + '&' + // pp_Password
      transactionRef + '&' + // pp_TxnRefNo
      amountString + '&' + // pp_Amount (paisa)
      'PKR' + '&' + // pp_TxnCurrency
      dateTime + '&' + // pp_TxnDateTime
      `BOOK${amountNum}` + '&' + // pp_BillReference
      `Book Purchase - PKR ${amountNum}` + '&' + // pp_Description
      returnUrl + '&' + // pp_ReturnURL
      ppmpf_1 + '&' +
      ppmpf_2 + '&' +
      ppmpf_3 + '&' +
      ppmpf_4 + '&' +
      ppmpf_5 + '&' +
      this.config.salt;

    const secureHash = crypto
      .createHash('sha256')
      .update(integrityString)
      .digest('hex')
      .toUpperCase();

    const paymentData = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: this.config.merchantId,
      pp_Password: this.config.password,
      pp_TxnRefNo: transactionRef,
      pp_Amount: amountString,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: dateTime,
      pp_BillReference: `BOOK${amountNum}`,
      pp_Description: `Book Purchase - PKR ${amountNum}`,
      pp_ReturnURL: returnUrl,
      pp_SecureHash: secureHash,
      ppmpf_1,
      ppmpf_2,
      ppmpf_3,
      ppmpf_4,
      ppmpf_5
    };

    return {
      paymentURL: `${this.config.baseUrl}/ApplicationAPI/API/Payment/DoTransaction`,
      paymentData,
      transactionRef
    };
  }

  /**
   * Verify JazzCash callback response
   * Uses responseData.pp_ResponseCode & pp_TxnRefNo & pp_Amount & salt
   */
  verifyCallback(responseData) {
    try {
      if (!responseData) return false;
      const integrityString = [
        responseData.pp_ResponseCode || '',
        responseData.pp_TxnRefNo || '',
        responseData.pp_Amount || '',
        this.config.salt || ''
      ].join('&');

      const calculatedHash = crypto
        .createHash('sha256')
        .update(integrityString)
        .digest('hex')
        .toUpperCase();

      // Logging for debugging
      console.log('JazzCash Callback verify: built=', integrityString);
      console.log('JazzCash Callback verify: calcHash=', calculatedHash);
      console.log('JazzCash Callback verify: provided=', responseData.pp_SecureHash);

      return calculatedHash === (responseData.pp_SecureHash || '').toUpperCase();
    } catch (err) {
      console.error('verifyCallback error:', err);
      return false;
    }
  }

  // Alternative (same algorithm, kept for compatibility)
  verifyCallbackAlternative(responseData) {
    return this.verifyCallback(responseData);
  }

  /**
   * Payout method (kept mostly same, ensured consistent formatting)
   */
  async sendPayout(recipientNumber, amount, description = 'Bookstore Payout') {
    try {
      const transactionRef = `PAYOUT${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const amountNum = Number(amount) || 0;
      const amountInPaisa = Math.round(amountNum * 100);
      const amountString = amountInPaisa.toString();
      const dateTime = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);

      const integrityString = [
        '2.0', // pp_Version
        'MWALLET',
        'EN',
        this.config.merchantId,
        this.config.password,
        transactionRef,
        amountString,
        'PKR',
        dateTime,
        `payout_${recipientNumber}`,
        description,
        '', // pp_BankID
        '', // pp_ProductID
        recipientNumber,
        '', // pp_CNIC
        this.config.salt
      ].join('&');

      const secureHash = crypto.createHash('sha256').update(integrityString).digest('hex').toUpperCase();

      const payoutData = {
        pp_Version: '2.0',
        pp_TxnType: 'MWALLET',
        pp_Language: 'EN',
        pp_MerchantID: this.config.merchantId,
        pp_Password: this.config.password,
        pp_TxnRefNo: transactionRef,
        pp_Amount: amountString,
        pp_TxnCurrency: 'PKR',
        pp_TxnDateTime: dateTime,
        pp_BillReference: `payout_${recipientNumber}`,
        pp_Description: description,
        pp_SecureHash: secureHash,
        pp_BankID: '',
        pp_ProductID: '',
        pp_MobileNumber: recipientNumber,
        pp_CNIC: ''
      };

      // POST as form-encoded
      const response = await axios.post(
        `${this.config.baseUrl}/ApplicationAPI/API/Payment/DoTransaction`,
        new URLSearchParams(payoutData).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 30000 }
      );

      // Normalize response
      let responseData;
      if (typeof response.data === 'string') {
        try {
          responseData = JSON.parse(response.data);
        } catch {
          responseData = Object.fromEntries(new URLSearchParams(response.data).entries());
        }
      } else responseData = response.data;

      return responseData;
    } catch (error) {
      console.error('sendPayout error:', error?.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Inquiry
   */
  async checkTransactionStatus(transactionRef) {
    try {
      const dateTime = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);

      const integrityString = [
        '1.1',
        'INQUIRY',
        'EN',
        this.config.merchantId,
        this.config.password,
        transactionRef,
        dateTime,
        this.config.salt
      ].join('&');

      const secureHash = crypto.createHash('sha256').update(integrityString).digest('hex').toUpperCase();

      const inquiryData = {
        pp_Version: '1.1',
        pp_TxnType: 'INQUIRY',
        pp_Language: 'EN',
        pp_MerchantID: this.config.merchantId,
        pp_Password: this.config.password,
        pp_TxnRefNo: transactionRef,
        pp_TxnDateTime: dateTime,
        pp_SecureHash: secureHash
      };

      const response = await axios.post(
        `${this.config.baseUrl}/ApplicationAPI/API/Payment/InquireTransaction`,
        new URLSearchParams(inquiryData).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 30000 }
      );

      return response.data;
    } catch (error) {
      console.error('checkTransactionStatus error:', error?.response?.data || error.message);
      throw error;
    }
  }

  parseCallbackResponse(body) {
    try {
      if (typeof body === 'string') {
        if (body.trim().startsWith('{')) return JSON.parse(body);
        return Object.fromEntries(new URLSearchParams(body).entries());
      }
      return body;
    } catch (err) {
      console.error('parseCallbackResponse error:', err);
      return body;
    }
  }
}

module.exports = new JazzCashService();
