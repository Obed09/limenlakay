# 📱 Telegram Notifications Setup Guide

## Quick Setup (5 minutes)

Follow these steps to receive instant Telegram notifications when retailers scan your products.

---

## Step 1: Create Your Telegram Bot

1. **Open Telegram** on your phone or desktop

2. **Search for @BotFather** (official Telegram bot creator)

3. **Start a chat** and send this command:
   ```
   /newbot
   ```

4. **Choose a name** for your bot:
   ```
   Limen Lakay Inventory Bot
   ```

5. **Choose a username** (must end with 'bot'):
   ```
   LimenLakayInventoryBot
   ```

6. **Copy your Bot Token** - you'll get something like:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
   ```
   ⚠️ **Keep this secret!**

---

## Step 2: Get Your Chat ID

1. **Send a message** to your new bot (search for it in Telegram and start a chat)
   - Send any message like: "Hello"

2. **Open this URL** in your browser (replace `YOUR_BOT_TOKEN` with your actual token):
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```

3. **Find your Chat ID** in the response:
   ```json
   {
     "ok": true,
     "result": [{
       "message": {
         "chat": {
           "id": 123456789,  <-- This is your Chat ID
           "first_name": "Your Name",
           "type": "private"
         }
       }
     }]
   }
   ```

---

## Step 3: Add to Environment Variables

### For Local Development:

1. Open `e:\limen-lakay\.env.local`

2. Update these lines:
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
   TELEGRAM_CHAT_ID=123456789
   ```

3. Restart your dev server

### For Production (Vercel):

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)

2. Select your **limen-lakay** project

3. Go to **Settings** → **Environment Variables**

4. Add two new variables:
   - **Name:** `TELEGRAM_BOT_TOKEN`
     **Value:** Your bot token
     
   - **Name:** `TELEGRAM_CHAT_ID`
     **Value:** Your chat ID

5. **Redeploy** your project

---

## Step 4: Test It!

1. **Add a test product** in the database:
   ```sql
   INSERT INTO tracked_products (
     product_name, 
     sku, 
     tracking_code,
     price,
     remaining_quantity
   )
   VALUES (
     'Test Candle',
     'TEST-001',
     'TRK-TEST-001',
     32.00,
     10
   );
   ```

2. **Visit the tracking page:**
   ```
   https://www.limenlakay.com/track/TRK-TEST-001
   ```

3. **Record a sale:**
   - Select "Record Sale"
   - Enter retailer code: `TEST-2025-001`
   - Enter quantity: 1
   - Submit

4. **Check Telegram** - you should receive a message like:

   ```
   🔔 New Sale Recorded

   📦 Product Information
   ━━━━━━━━━━━━━━━━
   🏷️ Product: Test Candle
   📋 SKU: TEST-001
   🔗 Tracking: TRK-TEST-001
   📊 Quantity: 1 units
   💵 Sale Price: $32.00
   📦 Remaining: 9 units

   🏪 Store Information
   ━━━━━━━━━━━━━━━━
   🏬 Store: Test Boutique
   📧 Email: test@testboutique.com
   📞 Phone: 561-123-4567
   🔑 Code: TEST-2025-001

   🔗 View Dashboard

   ━━━━━━━━━━━━━━━━
   🕯️ Limen Lakay | 561 593 0238
   ```

---

## Notification Types

You'll receive Telegram alerts for:

- 🛍️ **Sales** - When a retailer records a sale
- 📥 **Inventory Received** - When products arrive at a store
- 📦 **Inventory Check** - When retailers check stock
- ↩️ **Returns** - When products are returned

---

## Troubleshooting

### Not Receiving Messages?

1. **Check bot token is correct** in environment variables
2. **Make sure you sent a message** to the bot first
3. **Verify chat ID** is a number (not a string)
4. **Check Vercel logs** for any errors

### Message Format Issues?

- Telegram uses Markdown formatting
- If you see weird characters, the API is working but formatting needs adjustment

### Multiple People Need Notifications?

**Option 1: Create a Telegram Group**
1. Create a group in Telegram
2. Add your bot to the group
3. Get the group's chat ID (will be negative like `-123456789`)
4. Use that as your `TELEGRAM_CHAT_ID`

**Option 2: Multiple Bots**
- Create separate bots for each person
- Modify the code to send to multiple chat IDs

---

## Security Best Practices

✅ **DO:**
- Keep your bot token secret
- Only share with trusted team members
- Regularly check bot settings with @BotFather

❌ **DON'T:**
- Commit `.env.local` to git (it's already in .gitignore)
- Share your bot token publicly
- Use the same token for multiple projects

---

## Customization

Want to change the notification format? Edit:
```
app/api/tracking/notify/route.ts
```

The `telegramMessage` variable contains the message template.

---

## Support

Need help setting up?
- 📞 Phone: 561 593 0238
- ✉️ Email: info@limenlakay.com

---

Happy tracking! 🚀
