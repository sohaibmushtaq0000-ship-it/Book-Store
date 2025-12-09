const Payment = require("../models/payment.model.js");
const Book = require("../models/book.model.js");
const User = require("../models/user.model.js");
const Purchase = require("../models/purchases.model.js");
const Commission = require("../models/commission.model.js");
const { createPaymentWithCommission, verifyJazzCashResponse } = require("../services/payment.service.js");
const PayoutService = require("../services/payout.service.js");

const createPayment = async (req, res) => {
  try {
    const { bookId } = req.body;
    
    // Check authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    const userId = req.user.id;
    
    // Get book details
    const book = await Book.findById(bookId).populate('uploader');
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        message: "Book not found" 
      });
    }
    
    if (book.status !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: "Book is not available for purchase" 
      });
    }
    
    // Check if already purchased
    const existingPurchase = await Purchase.findOne({
      user: userId,
      book: bookId,
      paymentStatus: 'completed'
    });
    
    if (existingPurchase) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already purchased this book" 
      });
    }
    
    const amount = book.discountedPrice || book.price;
    const sellerType = book.uploaderType || 'admin';
    
    // Create payment with commission calculation
    const paymentData = await createPaymentWithCommission(
      amount, 
      userId, 
      bookId, 
      book.uploader._id,
      sellerType
    );
    
    // Save payment record
    const paymentRecord = await Payment.create({
      user: userId,
      book: bookId,
      amount: amount,
      seller: book.uploader._id,
      sellerType: sellerType,
      commission: paymentData.commission,
      transactionRef: paymentData.transactionRef,
      status: "PENDING",
      jazzcashResponse: {},
      metadata: {
        bookTitle: book.title,
        sellerName: book.uploader.fullName
      }
    });
    
    return res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      payment: paymentData,
      paymentId: paymentRecord._id,
      redirectUrl: paymentData.paymentURL,
      transactionRef: paymentData.transactionRef,
      commissionBreakdown: paymentData.commission
    });
  } catch (error) {
    console.error("Payment Creation Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
};

const jazzCashReturn = async (req, res) => {
  try {
    console.log("JazzCash Callback Received:", req.body);
    const responseData = req.body;
    const transactionRef = responseData.pp_TxnRefNo;
    
    if (!transactionRef) {
      return res.status(400).send(`
        <html>
          <body>
            <h1>Invalid Payment Response</h1>
            <p>No transaction reference found</p>
          </body>
        </html>
      `);
    }
    
    // Verify JazzCash response
    console.log("Verifying JazzCash response for transaction:", responseData);
    const isValid = verifyJazzCashResponse(responseData);
    if (!isValid) {
      console.error("Invalid JazzCash response signature");
      return res.status(400).send(`
        <html>
          <body>
            <h1>Invalid Payment Signature</h1>
            <p>Payment verification failed</p>
          </body>
        </html>
      `);
    }
    
    // Find payment record
    const payment = await Payment.findOne({ transactionRef })
      .populate('book')
      .populate('seller')
      .populate('user');
    console.log("Payment record found:", transactionRef);
    if (!payment) {
      console.error("Payment not found for transaction:", transactionRef);
      return res.status(404).send(`
        <html>
          <body>
            <h1>Payment Not Found</h1>
            <p>Transaction ID: ${transactionRef}</p>
          </body>
        </html>
      `);
    }
    
    // Update payment status
    const status = responseData.pp_ResponseCode === "000" ? "SUCCESS" : "FAILED";
    payment.status = status;
    payment.jazzcashResponse = responseData;
    
    if (status === "SUCCESS") {
      // Create purchase record
      const purchase = await Purchase.create({
        user: payment.user._id,
        book: payment.book._id,
        type: 'book',
        format: 'pdf',
        amount: payment.amount,
        seller: payment.seller._id,
        sellerType: payment.sellerType,
        commission: payment.commission,
        paymentMethod: 'jazzcash',
        paymentStatus: 'completed',
        transactionId: transactionRef,
        paymentDetails: {
          method: 'jazzcash',
          transactionId: transactionRef,
          amount: payment.amount,
          currency: 'PKR',
          status: 'completed',
          timestamp: new Date()
        }
      });
      
      // Create commission record
      const commission = await Commission.create({
        payment: payment._id,
        book: payment.book._id,
        buyer: payment.user._id,
        seller: payment.seller._id,
        sellerType: payment.sellerType,
        totalAmount: payment.amount,
        sellerAmount: payment.commission.sellerAmount,
        superadminAmount: payment.commission.superadminAmount,
        commissionPercentage: payment.commission.commissionPercentage,
        status: "PROCESSED",
        processedAt: new Date()
      });
      
      // Distribute earnings using your existing function
      const { distributePurchaseEarnings } = require('./purchase.controller');
      await distributePurchaseEarnings(purchase);
      
      // Update payment earnings status
      payment.earningsStatus = 'PROCESSED';
      
      console.log(`Payment ${transactionRef} completed. Commission distributed.`);
    }
    
    await payment.save();
    
    // Return appropriate HTML response
    if (status === "SUCCESS") {
      const successHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Successful</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
            .details { text-align: left; background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .btn { display: inline-block; padding: 10px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅ Payment Successful!</div>
            <div class="details">
              <p><strong>Transaction ID:</strong> ${transactionRef}</p>
              <p><strong>Amount:</strong> PKR ${payment.amount}</p>
              <p><strong>Book:</strong> ${payment.book?.title || 'Book'}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>Your book is now available for download.</p>
            <p>You will be redirected to your dashboard in 5 seconds...</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/books" class="btn">Go to Dashboard</a>
          </div>
          <script>
            setTimeout(() => {
              window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/books';
            }, 5000);
          </script>
        </body>
        </html>
      `;
      return res.send(successHtml);
    } else {
      const failedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Failed</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
            .details { text-align: left; background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .btn { display: inline-block; padding: 10px 30px; background: #6c757d; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌ Payment Failed</div>
            <div class="details">
              <p><strong>Transaction ID:</strong> ${transactionRef}</p>
              <p><strong>Response Code:</strong> ${responseData.pp_ResponseCode}</p>
              <p><strong>Message:</strong> ${responseData.pp_ResponseMessage || 'Payment was not successful'}</p>
            </div>
            <p>Please try again or contact support if the problem persists.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/books/${payment.book?._id || ''}" class="btn">Try Again</a>
          </div>
          <script>
            setTimeout(() => {
              window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:3000'}/books';
            }, 5000);
          </script>
        </body>
        </html>
      `;
      return res.send(failedHtml);
    }
  } catch (error) {
    console.error("Callback Error:", error);
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Processing Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #ddd; border-radius: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Payment Processing Error</h1>
          <p>An error occurred while processing your payment.</p>
          <p>Please contact support with your transaction details.</p>
        </div>
        <script>
          setTimeout(() => {
            window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:3000'}';
          }, 5000);
        </script>
      </body>
      </html>
    `;
    res.status(500).send(errorHtml);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment ID is required" 
      });
    }

    const payment = await Payment.findById(paymentId)
      .populate('book', 'title')
      .populate('user', 'firstName lastName')
      .populate('seller', 'firstName lastName');
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found" 
      });
    }

    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        transactionRef: payment.transactionRef,
        book: payment.book,
        seller: payment.seller,
        commission: payment.commission,
        earningsStatus: payment.earningsStatus,
        createdAt: payment.createdAt,
      }
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
};

const jazzCashWebhook = async (req, res) => {
  try {
    console.log("JazzCash Webhook Received:", req.body);
    const responseData = req.body;
    const transactionRef = responseData.pp_TxnRefNo;
    
    if (transactionRef && responseData.pp_ResponseCode === "000") {
      const payment = await Payment.findOne({ transactionRef });
      
      if (payment && payment.status !== "SUCCESS") {
        // Update payment status
        payment.status = "SUCCESS";
        payment.jazzcashResponse = responseData;
        await payment.save();
        
        // Distribute earnings (async - don't wait)
        setTimeout(async () => {
          try {
            await payment.distributeEarnings();
          } catch (error) {
            console.error("Webhook earnings distribution error:", error);
          }
        }, 0);
        
        console.log(`Webhook: Payment ${transactionRef} processed`);
      }
    }
    
    // Always return 200 to JazzCash
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(200).json({ received: true });
  }
};

module.exports = { 
  createPayment, 
  jazzCashReturn, 
  verifyPayment,
  jazzCashWebhook
};