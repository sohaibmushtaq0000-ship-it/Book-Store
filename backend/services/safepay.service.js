// services/safepay.service.js
const axios = require('axios');
const crypto = require('crypto');

const SANDBOX_BASE = 'https://sandbox.api.getsafepay.com';
const PRODUCTION_BASE = 'https://api.getsafepay.com';

class SafepayService {
  constructor() {
    const env = process.env.SAFEPAY_ENVIRONMENT || 'sandbox';
    const baseUrl = env === 'production' ? PRODUCTION_BASE : SANDBOX_BASE;
    this.config = {
      secretKey: process.env.SAFEPAY_SECRET_KEY,
      publicKey: process.env.SAFEPAY_PUBLIC_KEY,
      webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET,
      environment: env,
      baseUrl: baseUrl
    };
  }

  /**
   * Create a payment request
   * @param {number} amount - Amount in PKR
   * @param {string} userId - User ID
   * @param {string} bookId - Book ID
   * @param {string} sellerId - Seller ID
   * @param {object} metadata - Additional metadata
   */
  _authHeaders() {
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-sfpy-merchant-secret": this.config.secretKey
    };
  }

  async createPaymentRequest(amount, userId, bookId, sellerId, metadata = {}) {
    try {
      const amountNum = Number(amount);
      // Safepay v3 only allows specific metadata keys (e.g. order_id). Custom keys like bookId cause "unsupported meta key".
      const transactionRef = `SP_${Date.now()}_${userId.substring(0, 8)}`;
      const safepayMetadata = {
        order_id: transactionRef
      };
      // Safepay v3 expects merchant_api_key = "Public key" from dashboard (sec_xxx).
      // Auth header x-sfpy-merchant-secret = "Secret key" from dashboard (hex).
      const merchantApiKey =
        process.env.SAFEPAY_MERCHANT_API_KEY ||
        this.config.publicKey ||
        this.config.secretKey;
      if (!merchantApiKey) {
        throw new Error("Safepay: SAFEPAY_SECRET_KEY or SAFEPAY_MERCHANT_API_KEY is required.");
      }

      const sessionPayload = {
        merchant_api_key: merchantApiKey,
        intent: "CYBERSOURCE",
        mode: "payment",
        entry_mode: "raw",
        currency: "PKR",
        amount: Math.round(amountNum * 100), // lowest denomination (paisa): 5 PKR = 500
        metadata: safepayMetadata,
        include_fees: false
      };

      console.log("Creating Safepay v3 payment session:", { ...sessionPayload, merchant_api_key: "(set)", amount: sessionPayload.amount });

      const sessionRes = await axios.post(
        `${this.config.baseUrl}/order/payments/v3/`,
        sessionPayload,
        { headers: this._authHeaders() }
      );

      console.log("Safepay v3 session response:", sessionRes.data?.data ? "tracker received" : sessionRes.data);

      const trackerToken = sessionRes.data?.data?.tracker?.token;

      if (!trackerToken) {
        throw new Error("Invalid response from Safepay: missing tracker token. " + (JSON.stringify(sessionRes.data) || ""));
      }

      // Short-lived auth token: embedded page uses it to call reporter API (required for v3 flow)
      let tbt = null;
      try {
        const passportRes = await axios.post(
          `${this.config.baseUrl}/client/passport/v1/token`,
          {},
          { headers: this._authHeaders() }
        );
        tbt = passportRes.data?.data;
        if (!tbt) {
          console.warn("Safepay passport token empty response:", passportRes.data);
        }
      } catch (passportErr) {
        console.warn("Safepay passport token failed:", passportErr.response?.data || passportErr.message);
      }

      if (!tbt) {
        throw new Error("Safepay checkout requires passport token (tbt). Check that SAFEPAY_SECRET_KEY is correct and x-sfpy-merchant-secret is accepted.");
      }

      const base = this.config.baseUrl ? this.config.baseUrl.replace(/\/$/, '') : '';
      const checkoutBase = base ? `${base}/embedded/` : '';
      if (!checkoutBase) throw new Error("SAFEPAY_BASE_URL must be set in .env");

      const successUrl = process.env.SAFEPAY_SUCCESS_URL;
      const cancelUrl = process.env.SAFEPAY_CANCEL_URL;
      if (!successUrl || !cancelUrl) throw new Error("SAFEPAY_SUCCESS_URL and SAFEPAY_CANCEL_URL must be set in .env");

      const params = new URLSearchParams({
        environment: this.config.environment,
        tracker: trackerToken,
        tbt,
        source: "hosted",
        redirect_url: successUrl,
        cancel_url: cancelUrl
      });

      const paymentUrl = `${checkoutBase}?${params.toString()}`;
      return {
        paymentUrl,
        tracker: trackerToken,
        transactionRef,
        metadata: {
          userId,
          bookId,
          sellerId,
          ...metadata
        }
      };

    } catch (error) {
      console.error("Safepay createPaymentRequest error:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verify payment (v3 trackers: use reporter API; legacy v1 trackers: order/v1)
   * @param {string} tracker - Tracker token
   */
  async verifyPayment(tracker) {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/reporter/api/v1/payments/${tracker}`,
        { headers: this._authHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error("Safepay verifyPayment error:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   * @param {Buffer} rawBody - Raw request body
   * @param {string} signature - X-SFPY-Signature header
   */
  verifyWebhookSignature(rawBody, signature) {
    if (!signature) {
      return false;
    }

    const computedSignature = crypto
      .createHmac("sha256", this.config.webhookSecret)
      .update(rawBody)
      .digest("hex");

    return signature.toLowerCase() === computedSignature;
  }

  /**
   * Parse webhook event
   * @param {object} eventData - Webhook data
   */
  parseWebhookEvent(eventData) {
    const event = eventData;
    
    const paymentData = {
      tracker: event.tracker || event.data?.tracker?.token,
      amount: event.amount || event.data?.amount,
      currency: event.currency || event.data?.currency || 'PKR',
      status: event.event === 'payment.completed' ? 'paid' : (event.status || 'unknown'),
      metadata: event.metadata || event.data?.metadata || {},
      timestamp: new Date(event.timestamp || Date.now())
    };

    return paymentData;
  }
}

module.exports = new SafepayService();