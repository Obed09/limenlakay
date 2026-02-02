# 🚀 Meta (Instagram/Facebook) Auto-Posting Setup Guide

## ✅ What You've Done So Far:
1. Created Meta App: "Limen Lakay Social Manager"
2. Added Instagram & Facebook posting permissions
3. App credentials saved to `.env.local`

## 📱 Next Steps to Enable Auto-Posting:

### Step 1: Connect Your Instagram Business Account

**Important:** Your Instagram must be a **Business Account** (not Personal or Creator)

#### If Your Instagram is Personal:
1. Open Instagram app on your phone
2. Go to **Settings → Account → Switch to Professional Account**
3. Choose **"Business"**
4. Connect to your Facebook Page

#### If Already Business:
1. Make sure it's linked to a Facebook Page
2. Go to Instagram Settings → Business → Linked Accounts → Facebook
3. Connect your Facebook Business Page

### Step 2: Get Your Access Token

You need to authorize the app to post on your behalf.

**Option A: Using Graph API Explorer (Quick Test)**
1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your app: "Limen Lakay Social Manager"
3. Click **"Generate Access Token"**
4. Select permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
5. Click **"Generate Access Token"** and copy it

**Option B: OAuth Flow (Production - I'll Build This Next)**
- I'll create a "Connect Instagram" button in your social media manager
- Click it → Authorize → Tokens saved automatically

### Step 3: Get Your Instagram Account ID

1. Go to Graph API Explorer: https://developers.facebook.com/tools/explorer/
2. Paste your access token
3. In the query field, enter: `me/accounts`
4. Click **Submit**
5. Copy your Page ID from the response
6. Then query: `YOUR_PAGE_ID?fields=instagram_business_account`
7. Copy the `instagram_business_account.id` - this is your Instagram Account ID

### Step 4: Add Tokens to Your App

Once you have:
- ✅ Access Token
- ✅ Instagram Account ID  
- ✅ Facebook Page ID

**Send them to me** and I'll:
1. Save them securely
2. Update the social media manager to use them
3. Enable the Instagram/Facebook post buttons

---

## 🎯 What Happens After Setup:

### On Social Media Manager Page:
1. **Generate content** with AI (uses your voice profile!)
2. **Click Instagram button** → Post goes live instantly with image
3. **Click Facebook button** → Post published to your Page
4. **Status updates** → See "Posted successfully" with link

### Automatic Features:
- ✅ **One-click posting** (no copy-paste needed)
- ✅ **Image upload** handled automatically
- ✅ **Caption formatting** optimized for each platform
- ✅ **Hashtags included** from AI generation
- ✅ **Error handling** with retry logic
- ✅ **Post tracking** (saves external post IDs)

---

## 🔐 Security Notes:

**Current Setup (Development):**
- Access tokens stored in environment variables
- Good for testing and personal use

**For Production (Later):**
- I'll encrypt tokens in database
- Add token refresh logic (renew every 60 days)
- Multi-user support (each user authenticates separately)

---

## ❓ Troubleshooting:

### "Invalid OAuth 2.0 Access Token"
- Token expired (60-day limit)
- Generate new token using Graph API Explorer

### "Instagram account not found"
- Make sure Instagram is Business account
- Verify it's linked to Facebook Page
- Check Instagram Account ID is correct

### "Error publishing container"
- Image URL must be publicly accessible
- Wait 2-3 seconds between create and publish
- Check image size < 8MB

---

## 📞 Current Status:

**Ready to Test:**
- ✅ API endpoints created
- ✅ Error handling implemented
- ✅ Meta app configured

**Waiting For:**
- 🔶 Your Access Token
- 🔶 Instagram Account ID
- 🔶 Facebook Page ID

**Once you send me these 3 items, I'll integrate them and you can start auto-posting immediately!** 🎉

---

## 🎥 About Video Generation:

Want me to build the video feature too? I can create:
- ✅ Slideshow from your images
- ✅ Text overlays with captions
- ✅ Owner's voice narration
- ✅ Auto-post to Instagram Reels

Let me know your preferences (mentioned in previous message) and I'll add it!
