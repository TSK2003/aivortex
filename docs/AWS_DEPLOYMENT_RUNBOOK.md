# 🚀 ApexLearn AWS Production Deployment & GitHub Runbook

This guide contains the exact, step-by-step commands to push your codebase cleanly to GitHub and deploy both frontend and backend to native AWS (EC2 + RDS + S3 + CloudFront).

---

## 📦 Part 1: Uploading Clean Code to GitHub

Your project is now protected by a **super-grade `.gitignore`** that automatically blocks:
- `node_modules/` (all subdirectories)
- `.env`, `.env.*` (all secrets and database credentials)
- `dist/`, `build/` (build outputs)
- `_audit/` (extracted audit files and reference PDFs)
- All log files (`*.log`), OS junk (`.DS_Store`, `Thumbs.db`), and IDE caches.

### Step 1: Initialize Git and Check Staged Files
In your project root (`project_aivortex`), run:

```bash
# 1. Initialize local Git repository
git init

# 2. Stage all project files (the .gitignore will protect secrets and build files)
git add .

# 3. Verify staged files before committing
git status
```

> **Security Check:** Confirm that no `.env` files (except `.env.example` and `.env.production.example`) appear in `git status`.

### Step 2: Create Initial Commit & Push to GitHub
```bash
# 4. Commit clean codebase
git commit -m "feat: complete production-ready ApexLearn LMS platform with AWS & PostgreSQL architecture"

# 5. Rename branch to main
git branch -M main

# 6. Add your remote GitHub repository URL
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git

# 7. Push to GitHub
git push -u origin main
```

---

## ☁️ Part 2: AWS Infrastructure Setup (Zero Docker)

```
                 CLIENT / BROWSER
                        │
                    Route 53
                        │
                AWS CloudFront
               ┌────────┴────────┐
               ▼                 ▼
         React Frontend      API Gateway Origin
            AWS S3          EC2 (Ubuntu 22.04 LTS)
                            ├── Nginx (Reverse Proxy)
                            └── PM2 (Cluster Mode)
                                  └── Node.js 20 Express
                                        │
                                  Amazon RDS PostgreSQL
```

---

## 🗄️ Part 3: Amazon RDS PostgreSQL Database

1. In the **AWS Management Console**, navigate to **RDS** $\to$ **Create Database**.
2. Select **PostgreSQL** (version 15 or 16).
3. Templates: **Production** (Multi-AZ for high availability) or **Dev/Test**.
4. Settings:
   - DB instance identifier: `apexlearn-db`
   - Master username: `apexadmin`
   - Master password: `[GENERATE_SECURE_PASSWORD]`
5. Connectivity:
   - VPC: Select your Application VPC.
   - Public access: **No** (Database stays completely private).
   - VPC Security Group: Allow inbound traffic on port `5432` **only** from the EC2 Backend Security Group (`sg-ec2-backend`).
6. Copy the **RDS Endpoint** once created:
   `apexlearn-db.cxxxxxxxx.ap-south-1.rds.amazonaws.com`

---

## 🖥️ Part 4: Deploying Backend to AWS EC2

### Step 1: Launch EC2 Instance
- **AMI**: Ubuntu 22.04 LTS or 24.04 LTS
- **Instance Type**: `t3.small` or `t3.medium` (2 vCPUs, 4GB RAM)
- **Security Group Inbound Rules**:
  - `80` (HTTP) $\to$ `0.0.0.0/0`
  - `443` (HTTPS) $\to$ `0.0.0.0/0`
  - `22` (SSH) $\to$ Your Administrator IP only

### Step 2: Connect via SSH & Install Dependencies
```bash
ssh -i "your-key.pem" ubuntu@ec2-xx-xx-xx-xx.compute-1.amazonaws.com

# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Verify installations
node -v   # Should show v20.x.x
npm -v
nginx -v

# Install PM2 globally
sudo npm install -g pm2
```

### Step 3: Clone Code & Configure Environment
```bash
# Clone your repository
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git /var/www/apexlearn

cd /var/www/apexlearn/backend

# Install production dependencies
npm install --omit=dev

# Generate Prisma Client
npx prisma generate

# Create your production .env file
cp .env.production.example .env
nano .env
```
> In `.env`, fill in your real `DATABASE_URL` (RDS), `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, etc.

### Step 4: Run Database Migrations
```bash
# Apply all Prisma migrations onto Amazon RDS PostgreSQL
npx prisma migrate deploy

# Optional: Run initial deterministic seed if setting up a fresh database
npm run seed
```

### Step 5: Start Backend with PM2 Cluster
```bash
# Start cluster mode using ecosystem configuration
pm2 start ecosystem.config.cjs --env production

# Ensure PM2 automatically restarts on EC2 reboot
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Step 6: Configure Nginx & SSL (Certbot)
```bash
# Copy Nginx template
sudo cp /var/www/apexlearn/docs/nginx-apexlearn.conf /etc/nginx/sites-available/apexlearn

# Enable configuration
sudo ln -s /etc/nginx/sites-available/apexlearn /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx syntax and reload
sudo nginx -t
sudo systemctl reload nginx

# Install free Let's Encrypt SSL certificate
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🌐 Part 5: Deploying Frontend to AWS S3 & CloudFront

### Step 1: Build Static Assets
On your local machine or CI server:
```bash
cd frontend

# Set production API URL in frontend/.env
# VITE_API_URL=https://api.yourdomain.com/api
# VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx

npm run build
```
This produces optimized production assets in `frontend/dist/`.

### Step 2: Upload to S3 Bucket
```bash
# Create private S3 bucket
aws s3 mb s3://apexlearn-frontend-prod --region ap-south-1

# Sync built assets to S3
aws s3 sync dist/ s3://apexlearn-frontend-prod --delete
```

### Step 3: Configure CloudFront Distribution
1. In AWS CloudFront $\to$ **Create Distribution**:
   - Origin domain: `apexlearn-frontend-prod.s3.ap-south-1.amazonaws.com`
   - Origin access: **Origin Access Control (OAC)** (S3 bucket stays 100% private).
   - Viewer protocol policy: **Redirect HTTP to HTTPS**.
   - Custom SSL Certificate: ACM certificate for `learn.yourdomain.com`.
   - Default root object: `index.html`.
2. In CloudFront **Error Pages**:
   - HTTP Error Code: `403` & `404` $\to$ Response Page Path: `/index.html` $\to$ Response Code: `200` (required for Single Page App client routing).

---

## ✅ Part 6: Post-Deployment Verification Checklist

1. **Backend Health Check**:
   ```bash
   curl -I https://api.yourdomain.com/health
   # Expected: HTTP/2 200 OK
   ```
2. **Public Courses API**:
   ```bash
   curl -s https://api.yourdomain.com/api/public/courses | grep "success"
   ```
3. **SSL Certificate**:
   Verify A+ rating at [SSL Labs](https://www.ssllabs.com/ssltest/).
4. **PM2 Monitor**:
   ```bash
   pm2 status
   pm2 logs apexlearn-backend
   ```
