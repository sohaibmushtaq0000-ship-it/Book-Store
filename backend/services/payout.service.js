const JazzCashService = require('./jazzcash.service');
const User = require('../models/user.model');
const Payout = require('../models/payout.model');
const Commission = require('../models/commission.model');
const { sendEmail } = require('../utils/2FA/sendEmail');

class PayoutService {
  constructor() {
    this.minimumPayout = parseInt(process.env.MINIMUM_PAYOUT_AMOUNT) || 1000;
  }

  /**
   * Process automated payout for a user
   */
  async processAutoPayout(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has auto-payout enabled
      if (!user.payoutSettings.autoPayout) {
        return {
          success: false,
          message: 'Auto-payout not enabled for this user'
        };
      }

      // Check minimum balance
      if (user.wallet.availableBalance < this.minimumPayout) {
        return {
          success: false,
          message: `Minimum payout amount is ${this.minimumPayout}`
        };
      }

      // Check if wallet is verified based on payment method
      if (!this.isWalletVerified(user)) {
        return {
          success: false,
          message: 'Wallet not verified for selected payment method'
        };
      }

      const amount = user.wallet.availableBalance;
      const paymentMethod = user.payoutSettings.payoutMethod;
      
      // Create payout record
      const payout = await Payout.create({
        user: userId,
        amount: amount,
        paymentMethod: paymentMethod,
        recipientDetails: this.getRecipientDetails(user),
        status: 'PROCESSING',
        internalRef: `AUTO_${Date.now()}_${userId}`,
        notes: 'Automated payout'
      });

      // Find commissions to mark as paid
      const commissions = await Commission.find({
        seller: userId,
        status: 'PROCESSED',
        payout: { $exists: false }
      }).limit(50); // Limit to prevent too many updates

      // Update commissions with payout reference
      if (commissions.length > 0) {
        await Commission.updateMany(
          { _id: { $in: commissions.map(c => c._id) } },
          { 
            $set: { 
              payout: payout._id,
              status: 'PAID_OUT',
              paidOutAt: new Date()
            }
          }
        );
        
        payout.commissions = commissions.map(c => c._id);
        await payout.save();
      }

      // Process payout based on payment method
      let payoutResult;
      
      switch (paymentMethod) {
        case 'jazzcash':
          payoutResult = await this.processJazzCashPayout(user, amount, payout);
          break;
        case 'easypaisa':
          payoutResult = await this.processEasypaisaPayout(user, amount, payout);
          break;
        case 'bank':
          payoutResult = await this.processBankPayout(user, amount, payout);
          break;
        default:
          payoutResult = { success: false, message: 'Manual payout required' };
      }

      // Update payout status
      if (payoutResult.success) {
        payout.status = 'COMPLETED';
        payout.externalRef = payoutResult.transactionId;
        payout.completedAt = new Date();
        await payout.save();

        // Update user wallet
        user.wallet.availableBalance -= amount;
        user.wallet.totalWithdrawn += amount;
        user.wallet.lastPayoutDate = new Date();
        await user.save();

        // Send notification
        await this.sendPayoutNotification(user, payout, payoutResult);

        return {
          success: true,
          message: 'Payout processed successfully',
          payout: payout,
          transactionId: payoutResult.transactionId
        };
      } else {
        payout.status = 'FAILED';
        payout.failureReason = payoutResult.errorMessage || 'Payout failed';
        await payout.save();

        return {
          success: false,
          message: payoutResult.errorMessage || 'Payout failed',
          payout: payout
        };
      }

    } catch (error) {
      console.error('Payout processing error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Process JazzCash payout
   */
  async processJazzCashPayout(user, amount, payout) {
    const jazzcashNumber = user.wallet.jazzcash.number;
    
    if (!jazzcashNumber) {
      return {
        success: false,
        message: 'JazzCash number not found'
      };
    }

    try {
      const result = await JazzCashService.sendPayout(
        jazzcashNumber,
        amount,
        `Bookstore Payout - ${user.fullName}`
      );

      return result;
    } catch (error) {
      console.error('JazzCash payout error:', error);
      return {
        success: false,
        errorMessage: error.message
      };
    }
  }

  /**
   * Process Easypaisa payout (placeholder - implement as needed)
   */
  async processEasypaisaPayout(user, amount, payout) {
    // Implement Easypaisa API integration here
    return {
      success: false,
      message: 'Easypaisa payout not implemented yet'
    };
  }

  /**
   * Process Bank payout (placeholder - implement as needed)
   */
  async processBankPayout(user, amount, payout) {
    // Implement Bank transfer API integration here
    return {
      success: false,
      message: 'Bank payout not implemented yet'
    };
  }

  /**
   * Check if user's wallet is verified for selected payment method
   */
  isWalletVerified(user) {
    const method = user.payoutSettings.payoutMethod;
    
    switch (method) {
      case 'jazzcash':
        return user.wallet.jazzcash.verified;
      case 'easypaisa':
        return user.wallet.easypaisa.verified;
      case 'bank':
        return user.wallet.bankAccount.verified;
      case 'manual':
        return true; // Manual doesn't need verification
      default:
        return false;
    }
  }

  /**
   * Get recipient details based on payment method
   */
  getRecipientDetails(user) {
    const method = user.payoutSettings.payoutMethod;
    
    switch (method) {
      case 'jazzcash':
        return {
          jazzcashNumber: user.wallet.jazzcash.number
        };
      case 'easypaisa':
        return {
          easypaisaNumber: user.wallet.easypaisa.number
        };
      case 'bank':
        return {
          bankAccount: user.wallet.bankAccount
        };
      default:
        return {};
    }
  }

  /**
   * Send payout notification
   */
  async sendPayoutNotification(user, payout, result) {
    try {
      const emailContent = `
        <h2>Payout Processed Successfully</h2>
        <p>Hello ${user.fullName},</p>
        <p>Your payout of <strong>PKR ${payout.amount}</strong> has been processed successfully.</p>
        <p><strong>Transaction ID:</strong> ${result.transactionId || payout.internalRef}</p>
        <p><strong>Payment Method:</strong> ${payout.paymentMethod}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p>Thank you for being part of our bookstore!</p>
      `;

      await sendEmail({
        to: user.email,
        subject: 'Payout Processed Successfully',
        html: emailContent
      });
    } catch (error) {
      console.error('Failed to send payout notification:', error);
    }
  }

  /**
   * Process all eligible auto-payouts (cron job)
   */
  async processAllAutoPayouts() {
    try {
      console.log('Starting auto-payout processing...');
      
      const users = await User.find({
        'payoutSettings.autoPayout': true,
        'wallet.availableBalance': { $gte: this.minimumPayout }
      });

      console.log(`Found ${users.length} users eligible for auto-payout`);

      const results = [];
      for (const user of users) {
        try {
          const result = await this.processAutoPayout(user._id);
          results.push({
            userId: user._id,
            email: user.email,
            success: result.success,
            message: result.message,
            amount: user.wallet.availableBalance
          });
        } catch (error) {
          results.push({
            userId: user._id,
            email: user.email,
            success: false,
            message: error.message
          });
        }
      }

      console.log('Auto-payout processing completed:', results);
      return results;
    } catch (error) {
      console.error('Auto-payout processing error:', error);
      throw error;
    }
  }
}

module.exports = new PayoutService();