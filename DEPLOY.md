# Deploying WerePups Online

Get the game live on the internet so you and your friends can play from anywhere. Here are 3 options ranked by speed and cost.

---

## Option 1: Fly.io (Recommended — Fastest & Free Tier)

**Cost**: Free (up to 3 shared VMs)
**Time**: ~5 minutes
**What you need**: A credit card for verification (you won't be charged on the free tier)

### Steps

1. **Install the Fly CLI**

```bash
# macOS
brew install flyctl

# or via curl (any OS)
curl -L https://fly.io/install.sh | sh
```

2. **Sign up / Log in**

```bash
fly auth signup
# or if you already have an account:
fly auth login
```

3. **Launch the app** (run from the project root)

```bash
fly launch
```

When prompted:
- **App name**: pick something like `werepups` (or let it auto-generate)
- **Region**: pick the one closest to you and your friends
- **PostgreSQL / Redis**: No (we don't need a database)
- **Deploy now?**: Yes

That's it! Fly reads the existing `Dockerfile`, builds it, and deploys.

4. **Get your URL**

```bash
fly open
```

This opens `https://werepups.fly.dev` (or whatever name you chose) in your browser. Share that URL with your friends!

5. **Future deploys** (after making changes)

```bash
fly deploy
```

### Fly.io Tips
- The free tier gives you 3 shared-cpu-1x VMs with 256MB RAM — more than enough.
- If the app sleeps after inactivity, the first request takes ~3 seconds to wake it. To prevent this:

```bash
fly scale count 1 --max-per-region=1
```

- To see logs:

```bash
fly logs
```

---

## Option 2: Railway (Easy GUI, Free Trial)

**Cost**: Free $5/month trial credit, then ~$5/month
**Time**: ~5 minutes
**What you need**: A GitHub account

### Steps

1. Push your code to a **GitHub repository**:

```bash
git init
git add -A
git commit -m "Initial commit"
gh repo create werepups-online --public --push --source=.
```

2. Go to [railway.app](https://railway.app) and sign in with GitHub.

3. Click **"New Project"** → **"Deploy from GitHub repo"** → select your repo.

4. Railway auto-detects the Dockerfile and deploys. Wait ~2 minutes.

5. Go to **Settings → Networking → Generate Domain** to get a public URL like `werepups-online-production.up.railway.app`.

6. Share the URL with friends!

### Railway Tips
- Set the `PORT` environment variable to `8080` in the Railway dashboard (Settings → Variables) if it's not auto-detected.
- Railway gives you 500 hours/month on the free tier — plenty for game nights.

---

## Option 3: A Cheap VPS (Most Control, ~$4/month)

Good if you want a persistent server that's always on.

**Cost**: $4-6/month
**Providers**: [Hetzner](https://hetzner.com/cloud) ($4/mo), [DigitalOcean](https://digitalocean.com) ($4/mo), [Vultr](https://vultr.com) ($5/mo)

### Steps

1. **Create a VPS** — pick the cheapest option (1 vCPU, 1GB RAM, Ubuntu 24.04).

2. **SSH in and install Docker**:

```bash
ssh root@YOUR_SERVER_IP

# Install Docker
curl -fsSL https://get.docker.com | sh
```

3. **Clone and deploy**:

```bash
git clone https://github.com/YOUR_USERNAME/werepups-online.git
cd werepups-online
docker compose up -d --build
```

4. **Open the firewall**:

```bash
ufw allow 8080
```

5. Your game is live at `http://YOUR_SERVER_IP:8080`

### Adding HTTPS + a Custom Domain (Optional)

If you want `https://werepups.yourdomain.com`:

```bash
# Install Caddy (auto-HTTPS reverse proxy)
apt install -y caddy

# Edit Caddy config
cat > /etc/caddy/Caddyfile << 'EOF'
werepups.yourdomain.com {
    reverse_proxy localhost:8080
}
EOF

# Restart Caddy
systemctl restart caddy
```

Point your domain's DNS A record to your server IP. Caddy auto-provisions a free Let's Encrypt certificate.

---

## Option 4: Google Cloud Run (Pay-per-use, basically free)

**Cost**: Essentially free for low traffic (generous free tier)
**Time**: ~10 minutes

### Steps

1. **Install the gcloud CLI**: [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)

2. **Build and deploy**:

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy directly from Dockerfile
gcloud run deploy werepups \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --min-instances 0 \
  --max-instances 1
```

3. You'll get a URL like `https://werepups-xxxxx.a.run.app`

**Important note**: Cloud Run scales to zero when idle, which means WebSocket connections will drop after inactivity. This works for game sessions but the server might cold-start between games. Set `--min-instances 1` (~$7/month) if you want it always on.

---

## Quick Comparison

| Platform | Cost | Setup Time | Always On? | Custom Domain | Best For |
|----------|------|-----------|------------|---------------|----------|
| **Fly.io** | Free | 5 min | Yes (free) | Yes (free) | Best overall |
| **Railway** | Free trial | 5 min | Yes | Yes | GitHub integration |
| **Cheap VPS** | $4-6/mo | 15 min | Yes | Yes (with Caddy) | Full control |
| **Cloud Run** | ~Free | 10 min | No (scales to 0) | Yes | Pay-per-use |

---

## After Deploying

1. **Share the URL** with your friends — they just open it in any browser (mobile works too!)
2. **One person creates a room**, others join via the room browser or room code
3. You need **at least 3 players** for a good game (use the "Add Bot" button to fill in if needed)
4. The game works best with **5-8 players**

Have fun with your pack! 🐾
