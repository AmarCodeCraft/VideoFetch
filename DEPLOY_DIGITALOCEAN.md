# Deploy VideoFetch on DigitalOcean — Step by Step

यह guide aapko VideoFetch ko DigitalOcean pe deploy karne ke two tarike dikhata hai:

| Option | Best For | Cost | Difficulty |
|---|---|---|---|
| **A. Droplet (VPS)** | Full control, yt-dlp friendly | ~$6/mo | Medium |
| **B. App Platform** | Zero DevOps, auto-deploys | ~$5–12/mo | Easy |

> **Recommendation:** Droplet chuno — yt-dlp aur ffmpeg ko pre-install karna zaroori hai, jo App Platform pe thoda tricky hota hai.

---

## Prerequisites (Before You Start)

- ✅ DigitalOcean account with payment method added
- ✅ Code pushed to a **GitHub repo** (public or private)
- ✅ A domain name (optional but recommended — e.g. `videofetch.example.com`)
- ✅ An SSH key added to your DigitalOcean account

### Add SSH Key (if not done)

On your Windows machine (Git Bash):

```bash
# Generate a key if you don't have one
ssh-keygen -t ed25519 -C "your@email.com"

# Copy the public key
cat ~/.ssh/id_ed25519.pub
```

Paste into: **DigitalOcean → Settings → Security → Add SSH Key**

---

# Option A — Droplet Deployment (Recommended)

## Step 1: Create a Droplet

1. **DigitalOcean → Create → Droplets**
2. **Image:** Ubuntu 22.04 (LTS) x64
3. **Plan:** Basic → Regular CPU → **$6/mo** (1 GB RAM / 1 vCPU / 25 GB SSD)
   - ⚠️ For 1080p downloads: consider **$12/mo** (2 GB RAM) — ffmpeg needs memory
4. **Datacenter:** Choose closest to your users (e.g. Bangalore for India)
5. **Authentication:** SSH Key (select the one you added)
6. **Hostname:** `videofetch`
7. Click **Create Droplet**

Wait ~1 minute, then note the **public IPv4 address** (e.g. `139.59.12.34`).

---

## Step 2: SSH Into Your Droplet

From Git Bash on Windows:

```bash
ssh root@139.59.12.34
```

Type `yes` to accept the fingerprint. You should see the Ubuntu welcome banner.

---

## Step 3: Initial Server Setup

Update packages:

```bash
apt update && apt upgrade -y
```

Create a non-root user (safer than running everything as root):

```bash
adduser videofetch
usermod -aG sudo videofetch

# Copy SSH key so you can login as this user
rsync --archive --chown=videofetch:videofetch ~/.ssh /home/videofetch
```

Enable firewall:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

Switch to the new user:

```bash
exit   # log out of root
ssh videofetch@139.59.12.34
```

---

## Step 4: Install Node.js, Git, ffmpeg, Python

```bash
# Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v    # should print v20.x.x
npm -v

# Install git, ffmpeg (for 1080p merging), python3
sudo apt install -y git ffmpeg python3 python3-pip

# Verify
ffmpeg -version
python3 --version
```

> ✅ **Python is now available** on the server, so `youtube-dl-exec` ka preinstall check bina issue ke pass ho jayega.

---

## Step 5: Clone Your Repo

```bash
cd /home/videofetch
git clone https://github.com/YOUR_USERNAME/VideoFetch.git
cd VideoFetch
```

> If your repo is **private**, use a GitHub Personal Access Token:
> ```bash
> git clone https://<TOKEN>@github.com/YOUR_USERNAME/VideoFetch.git
> ```

---

## Step 6: Install Dependencies & Build Frontend

```bash
# Root (concurrently)
npm install

# Frontend
cd frontend
npm install
npm run build     # creates frontend/dist/

# Backend
cd ../server
npm install       # Python is installed now, so no skip needed
```

---

## Step 7: Install PM2 (Process Manager)

PM2 keeps your backend running forever — auto-restarts on crash and on reboot.

```bash
sudo npm install -g pm2

# Start the backend
cd /home/videofetch/VideoFetch/server
pm2 start index.js --name videofetch-api

# Save the process list + enable auto-start on reboot
pm2 save
pm2 startup systemd
```

The last command prints a `sudo env PATH=... pm2 startup ...` line — **copy-paste and run that exact line** to register with systemd.

Verify:

```bash
pm2 status
pm2 logs videofetch-api     # Ctrl+C to exit
```

You should see `🎬 VideoFetch backend running on http://localhost:3001`.

---

## Step 8: Install & Configure Nginx

Nginx will:
- Serve the built frontend (`frontend/dist/`)
- Proxy `/api/*` requests to the backend on port 3001

```bash
sudo apt install -y nginx
```

Create config:

```bash
sudo nano /etc/nginx/sites-available/videofetch
```

Paste (replace `videofetch.example.com` with **your domain or droplet IP**):

```nginx
server {
    listen 80;
    server_name videofetch.example.com;

    # Max body size for uploads (10 GB for big videos)
    client_max_body_size 10G;

    # Serve React frontend
    root /home/videofetch/VideoFetch/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API to Node backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # IMPORTANT: yt-dlp downloads can be slow — increase timeouts
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_connect_timeout 600s;

        # Disable buffering so downloads stream in real-time
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Gzip
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;
}
```

Save: `Ctrl+O`, Enter, `Ctrl+X`.

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/videofetch /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t                # test config
sudo systemctl reload nginx
```

---

## Step 9: Point Your Domain (Optional but Recommended)

In your DNS provider (Namecheap, GoDaddy, Cloudflare, etc.):

| Type | Name | Value |
|---|---|---|
| A | videofetch (or @) | 139.59.12.34 (your droplet IP) |

Wait 5–30 min for DNS propagation. Test:

```bash
ping videofetch.example.com
```

If IP matches, you're good.

---

## Step 10: Add Free SSL (HTTPS) via Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d videofetch.example.com
```

Follow prompts:
- Enter your email
- Agree to ToS
- Choose **redirect HTTP → HTTPS** (option 2)

Certbot auto-edits your Nginx config. Your site is now at `https://videofetch.example.com`.

Auto-renewal is already set up (check with `sudo certbot renew --dry-run`).

---

## Step 11: Test Your Deployment

Open in browser: `https://videofetch.example.com`

Check that:
- ✅ Frontend loads
- ✅ Navigation tabs work (Fetch / Watch / Offline)
- ✅ Fetching a YouTube URL works
- ✅ Clicking download (720p) actually downloads an MP4
- ✅ Uploaded videos play with the custom player

Debug backend logs if anything fails:

```bash
pm2 logs videofetch-api --lines 100
```

---

## Step 12: Updating the App (Future Deploys)

Create a one-liner deploy script:

```bash
nano /home/videofetch/deploy.sh
```

Paste:

```bash
#!/bin/bash
set -e
cd /home/videofetch/VideoFetch
git pull
cd frontend && npm install && npm run build
cd ../server && npm install
pm2 restart videofetch-api
echo "✅ Deployed at $(date)"
```

Make executable:

```bash
chmod +x /home/videofetch/deploy.sh
```

Now whenever you push to GitHub, just SSH in and run:

```bash
./deploy.sh
```

---

# Option B — App Platform Deployment

Easier setup but yt-dlp can be fragile. Only use if Option A feels overwhelming.

## Step 1: Push to GitHub

Make sure your repo has:
- `frontend/` with `package.json` + Vite build
- `server/` with `package.json` + Express

## Step 2: Create App

1. **DigitalOcean → Apps → Create App**
2. **Source:** GitHub → authorize → select `VideoFetch` repo → branch `main`
3. DigitalOcean auto-detects two services. Configure:

### Service 1: Frontend (Static Site)
- **Type:** Static Site
- **Source Directory:** `/frontend`
- **Build Command:** `npm install && npm run build`
- **Output Directory:** `dist`
- **HTTP Routes:** `/`

### Service 2: Backend (Web Service)
- **Type:** Web Service
- **Source Directory:** `/server`
- **Build Command:** `npm install`
- **Run Command:** `node index.js`
- **HTTP Port:** `3001`
- **HTTP Routes:** `/api`
- **Environment Variables:**
  - `YOUTUBE_DL_SKIP_PYTHON_CHECK=1`
  - `NODE_ENV=production`

## Step 3: Add ffmpeg (Critical!)

App Platform containers don't have ffmpeg. Add a **pre-build script** to `server/package.json`:

```json
{
  "scripts": {
    "preinstall": "apt-get update && apt-get install -y ffmpeg python3 || true"
  }
}
```

Or use a **Dockerfile** in `server/` for full control:

```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y ffmpeg python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "index.js"]
```

## Step 4: Choose Plan

- **Basic:** $5/mo (static) + $5/mo (backend) = **$10/mo**
- Click **Create Resources**

First deploy takes ~5 min. Your app will be at `https://your-app-name.ondigitalocean.app`.

---

# Common Issues & Fixes

| Issue | Fix |
|---|---|
| `yt-dlp: command not found` on droplet | `sudo npm install -g youtube-dl-exec` or reinstall `server/node_modules` |
| 1080p downloads fail / no audio | `sudo apt install ffmpeg` (must be on the server) |
| Backend crashes on first download | Run `pm2 restart videofetch-api && pm2 logs` to see the error |
| "502 Bad Gateway" from nginx | Backend isn't running. `pm2 status` and `pm2 restart videofetch-api` |
| Downloads cut off mid-stream | Nginx timeout — verify `proxy_read_timeout 600s` in config |
| Out of memory on 1 GB droplet | Upgrade to 2 GB OR set `--max-old-space-size=512` node flag |
| yt-dlp: "Sign in to confirm your age" | Add cookies support in `server/index.js` — see yt-dlp docs |
| Port 3001 exposed publicly | Don't open it in UFW. Nginx proxies it from localhost only ✅ |

---

# Security Checklist

- [ ] Non-root user (`videofetch`) created
- [ ] UFW firewall enabled (only 22, 80, 443 open)
- [ ] SSH key auth (disable password login in `/etc/ssh/sshd_config`: `PasswordAuthentication no`)
- [ ] HTTPS enabled via Certbot
- [ ] Backend only listens on `localhost:3001` (not `0.0.0.0`)
- [ ] Regular `sudo apt update && sudo apt upgrade -y` (monthly)
- [ ] Rate-limit the `/api/download` endpoint (add `express-rate-limit` to server)

---

# Estimated Monthly Costs

| Resource | Cost |
|---|---|
| Droplet (1 GB) | $6/mo |
| Droplet (2 GB, recommended) | $12/mo |
| Domain | $10–15/year |
| SSL (Let's Encrypt) | **Free** |
| Bandwidth (1 TB included) | **Free** |
| **Total (starter)** | **~$6–12/mo** |

---

# Quick Command Cheatsheet

```bash
# SSH in
ssh videofetch@YOUR_IP

# Backend logs
pm2 logs videofetch-api

# Restart backend
pm2 restart videofetch-api

# Rebuild frontend
cd ~/VideoFetch/frontend && npm run build

# Reload nginx
sudo systemctl reload nginx

# Check server stats
htop

# Deploy new version
./deploy.sh
```

---

**Done! 🎉** Your VideoFetch app is now live on the internet.

For questions or issues, check logs first: `pm2 logs videofetch-api`.
