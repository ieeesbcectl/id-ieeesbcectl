# IEEE SB QR ID Card System - Deployment Guide

This guide provides step-by-step instructions to deploy the complete ID card system. We will deploy the React frontend to Vercel, the Express backend to Railway, and configure the DNS records to link everything together.

## Overview
- **Backend (Express + SQLite):** Deployed on Railway. It uses a persistent volume to store the SQLite database file.
- **Frontend (React/Vite):** Deployed on Vercel.
- **Domains:** 
  - `api.ieeesbcectl.in` -> Railway (Backend)
  - `id.ieeesbcectl.in` -> Vercel (Frontend)

---

## 1. Deploy the Backend to Railway

Railway is ideal for this backend because it allows us to mount a persistent volume so that the SQLite database file isn't lost between deployments.

### Step 1: Create a Railway Account & Project
1. Go to [railway.app](https://railway.app/) and sign in using your GitHub account.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select this repository (`id.ieeesbcectl.in`).
4. Railway will analyze the repo. Since our backend is in a subfolder, we need to configure it before deploying.

### Step 2: Configure the Backend Service
1. After the service is created, go to the service settings.
2. In the **General** tab, under **Root Directory**, set it to: `/backend`
3. Go to the **Variables** tab and add the following Environment Variables:
   ```
   PORT=3000
   ADMIN_USERNAME=your_chosen_admin_username
   ADMIN_PASSWORD=your_secure_password
   JWT_SECRET=generate_a_long_random_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
   *(Make sure to use a secure, unique password and a long, random string for JWT_SECRET).*

### Step 3: Add a Persistent Volume (Crucial for SQLite)
If you don't do this, your database will reset every time you deploy!
1. Go to the **Volumes** tab in your Railway service settings.
2. Click **Create Volume**.
3. Under **Mount Path**, enter: `/app/database.db`
4. Wait for the service to redeploy. Now, your SQLite data is safe and persistent.

### Step 4: Configure the Custom Domain
1. Go to the **Settings** tab of the service, under the **Domains** section.
2. Click **Custom Domain** and enter: `api.ieeesbcectl.in`
3. Railway will give you a **CNAME** record to add to your DNS settings (e.g., pointing to something like `parking.railway.app`). We will add this later in the DNS step.

---

## 2. Deploy the Frontend to Vercel

Vercel is perfect for deploying the React frontend.

### Step 1: Create a Vercel Project
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository (`id.ieeesbcectl.in`).

### Step 2: Configure the Build Settings
1. Before deploying, Vercel needs to know this is a subfolder project.
2. Open the **Framework Preset** dropdown and ensure it says **Vite**.
3. Under **Root Directory**, click edit and select: `frontend`
4. Open the **Environment Variables** section and add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://api.ieeesbcectl.in` 
5. Click **Deploy**.

### Step 3: Configure the Custom Domain
1. Once deployed, go to the Vercel Project **Settings**.
2. Click on **Domains**.
3. Add the custom domain: `id.ieeesbcectl.in`
4. Vercel will provide a **CNAME** record (typically pointing to `cname.vercel-dns.com`).

---

## 3. Configure DNS Records

You need to point the subdomains to Vercel and Railway using your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare).

1. Log in to your domain registrar where `ieeesbcectl.in` is managed.
2. Navigate to the **DNS Management** or **DNS Settings** page.
3. Add a new **CNAME** record for the frontend:
   - **Type:** CNAME
   - **Name / Host:** `id`
   - **Value / Target:** `cname.vercel-dns.com` (or whatever Vercel provided)
   - **TTL:** Default/Auto
4. Add a new **CNAME** record for the backend:
   - **Type:** CNAME
   - **Name / Host:** `api`
   - **Value / Target:** The value provided by Railway (e.g., `something.up.railway.app`)
   - **TTL:** Default/Auto
5. Save the changes. Note that DNS propagation can take anywhere from a few minutes to 24 hours.

---

## 4. Final Testing & Admin Usage

Once the DNS has propagated, you can test the live site.

1. **Visit the Admin Panel:**
   Go to [https://id.ieeesbcectl.in/admin](https://id.ieeesbcectl.in/admin).
2. **Log In:**
   Use the `ADMIN_USERNAME` and `ADMIN_PASSWORD` you configured in Railway.
3. **Add a Member:**
   - Click 'Add Member' on the dashboard.
   - Fill in the details and upload a photo.
   - Save the member.
4. **Test the Public Profile:**
   - Click the link generated for the member, or manually visit `https://id.ieeesbcectl.in/profile/<member-uuid>`.
   - Verify the profile card loads correctly with the image and details.
5. **Download the QR Code:**
   - From the admin dashboard, download the QR code for the member.
   - Scan it with your phone to verify it opens the public profile link on mobile.
6. **Test Deletion:**
   - Delete a test member from the admin panel.
   - Verify the member is removed from the list.
   - Check your Cloudinary dashboard to ensure the image was automatically deleted to save space.
