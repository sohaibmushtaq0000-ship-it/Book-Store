const express = require("express");
const { 
  createPayment, 
  jazzCashReturn, 
  verifyPayment,
  jazzCashWebhook 
} = require("../controllers/payment.controller");
const { protect, isCustomer } = require("../middleware/auth.middleware");

const router = express.Router();

// ================== 🔐 PROTECTED ROUTES (Require Auth) ==================
router.use(protect); // All routes below require authentication

// Create JazzCash payment (Customer only)
router.post("/create", isCustomer, createPayment);

// Verify payment status
router.get("/verify/:paymentId", verifyPayment);

// ================== 🌐 PUBLIC ROUTES (No Auth Required) ==================

// JazzCash return URL (public callback from JazzCash)
router.post("/return", jazzCashReturn);

// JazzCash webhook (server-to-server notifications)
router.post("/webhook", jazzCashWebhook);

module.exports = router;