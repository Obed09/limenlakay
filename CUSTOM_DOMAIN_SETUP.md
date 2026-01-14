# Custom Domain Setup for Limen Lakay
## Adding limenlakay.com to Your Vercel Deployment

### 📋 Prerequisites
- Domain registered at your domain registrar (GoDaddy, Namecheap, etc.)
- Access to your domain's DNS settings
- Vercel project deployed: https://limenlakay-f4y6.vercel.app

---

## Step 1: Add Domain in Vercel

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `limenlakay-f4y6`

2. **Access Domain Settings**
   - Click on **Settings** tab
   - Click on **Domains** in the left sidebar

3. **Add Your Domain**
   - Enter: `limenlakay.com`
   - Click **Add**
   
4. **Also Add WWW Subdomain** (recommended)
   - Enter: `www.limenlakay.com`
   - Click **Add**
   - Set to redirect to `limenlakay.com`

---

## Step 2: Configure DNS Records

Vercel will show you which DNS records to add. You have two options:

### Option A: Using Vercel Nameservers (Recommended - Easiest)

1. **In Vercel, you'll see:**
   ```
   Update your nameservers to:
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

2. **Go to Your Domain Registrar**
   - Log in to where you bought limenlakay.com
   - Find "Nameservers" or "DNS Management"
   - Replace existing nameservers with:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`

3. **Save Changes**
   - Wait 24-48 hours for propagation (usually much faster)
   - Vercel will automatically configure everything

### Option B: Using Your Registrar's DNS (More Control)

If you prefer to keep your current nameservers:

1. **For limenlakay.com (Root Domain)**
   - Add an **A Record**:
     - Type: `A`
     - Name: `@` (or leave blank)
     - Value: `76.76.21.21`
     - TTL: `3600` (or automatic)

2. **For www.limenlakay.com**
   - Add a **CNAME Record**:
     - Type: `CNAME`
     - Name: `www`
     - Value: `cname.vercel-dns.com`
     - TTL: `3600` (or automatic)

---

## Step 3: Verify Domain

1. **Back in Vercel**
   - Wait a few minutes
   - Click **Refresh** next to your domain
   - Status should change to "Valid Configuration"

2. **SSL Certificate**
   - Vercel automatically provisions SSL
   - May take 1-5 minutes
   - Look for the 🔒 icon

---

## Step 4: Test Your Domain

1. **Check Domain Status**
   ```bash
   # In PowerShell, check DNS propagation
   nslookup limenlakay.com
   nslookup www.limenlakay.com
   ```

2. **Visit Your Sites**
   - https://limenlakay.com
   - https://www.limenlakay.com
   - Both should load your invoice system

3. **Test Invoice System**
   - Navigate to: https://limenlakay.com/admin-invoices
   - Verify everything works

---

## Common Domain Registrars

### GoDaddy
1. Log in to GoDaddy
2. My Products → Domains → Click your domain
3. DNS → Manage DNS
4. Update nameservers or add records

### Namecheap
1. Log in to Namecheap
2. Domain List → Manage
3. Advanced DNS (for records) or Domain (for nameservers)
4. Update as needed

### Google Domains / Squarespace
1. Log in to your account
2. My Domains → Manage
3. DNS → Custom records
4. Add A and CNAME records

### Cloudflare
1. Log in to Cloudflare
2. Select your domain
3. DNS → Records
4. Add A and CNAME records
5. Ensure proxy is ON (orange cloud)

---

## Troubleshooting

### Domain not working after 24 hours
```powershell
# Check DNS propagation globally
# Visit: https://dnschecker.org
# Enter: limenlakay.com
```

### SSL Certificate not provisioning
- Wait 5-10 minutes
- Click "Refresh SSL Certificate" in Vercel
- Ensure DNS records are correct

### "Invalid Configuration" in Vercel
- Double-check DNS records match exactly
- Remove any conflicting A or CNAME records
- Wait a few minutes and refresh

### Emails stop working
If you use email with your domain:
- Keep MX records unchanged
- Only modify A and CNAME records for web hosting
- Email uses different DNS records (MX)

---

## Update Environment Variables (Optional)

If you reference your domain in code:

```env
# .env.local or Vercel Environment Variables
NEXT_PUBLIC_SITE_URL=https://limenlakay.com
```

Update in Vercel:
1. Settings → Environment Variables
2. Add `NEXT_PUBLIC_SITE_URL` = `https://limenlakay.com`
3. Redeploy if needed

---

## Post-Setup Checklist

- [ ] Domain loads at https://limenlakay.com
- [ ] WWW redirects to non-WWW (or vice versa)
- [ ] SSL certificate is active (🔒 in browser)
- [ ] Invoice system works at /admin-invoices
- [ ] All images and assets load correctly
- [ ] Mobile responsive design works
- [ ] Email functionality still works (if applicable)

---

## DNS Propagation Timeline

- **Vercel Nameservers**: 1-4 hours (fastest)
- **A/CNAME Records**: 4-48 hours (typical: 4-6 hours)
- **Check Status**: https://dnschecker.org

---

## Quick Commands

```powershell
# Check if domain resolves
nslookup limenlakay.com

# Check SSL certificate
curl -I https://limenlakay.com

# Test invoice page
curl https://limenlakay.com/admin-invoices
```

---

## Need Help?

1. **Vercel Support**: https://vercel.com/support
2. **Check DNS Status**: https://dnschecker.org
3. **Vercel Docs**: https://vercel.com/docs/concepts/projects/domains

---

## Summary

**Recommended Approach:**
1. Use Vercel nameservers (easiest)
2. Add both `limenlakay.com` and `www.limenlakay.com`
3. Wait for SSL to provision
4. Test all functionality

**Timeline:**
- Configuration: 5 minutes
- DNS Propagation: 1-24 hours
- SSL Certificate: 1-5 minutes after DNS

Your invoice system will be live at:
- 🌐 https://limenlakay.com/admin-invoices
- 📧 Keep existing email services unchanged
- 🔒 Automatic SSL/HTTPS

---

Last Updated: January 2026
