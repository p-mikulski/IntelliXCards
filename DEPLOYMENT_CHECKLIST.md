# Quick Setup Checklist - Cloudflare Pages Deployment

## ⚠️ BEFORE YOU PUSH TO MASTER

**You MUST configure GitHub Environment Secrets first, or the build will fail!**

This project uses **GitHub Environments** (not repository secrets).

See error? Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
Learn more: [GITHUB_ENVIRONMENTS.md](./GITHUB_ENVIRONMENTS.md)

---

## ✅ Pre-Deployment Checklist

### GitHub Repository Setup (REQUIRED FIRST!)

- [ ] **Configure Production Environment Secrets** (Settings > Environments > production)
  
  **Supabase:**
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_KEY`
  
  **Cloudflare:**
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
  - [ ] `CLOUDFLARE_PROJECT_NAME`

### Cloudflare Setup

- [ ] **Create Cloudflare Pages Project** (if not exists)
  - Go to: Workers & Pages > Create application > Pages
  - Name it (use this name for `CLOUDFLARE_PROJECT_NAME` secret)

- [ ] **Configure Build Settings** (CRITICAL!)
  - Go to: Settings > Builds & deployments > Edit configuration
  - Set **Build command**: `npm run build:cloudflare`
  - Set **Build output directory**: `dist`
  - ⚠️ Using `npm run build` will cause HTTP 500 errors!

- [ ] **Generate API Token**
  - URL: https://dash.cloudflare.com/profile/api-tokens
  - Template: "Edit Cloudflare Workers"
  - Permission: `Account > Cloudflare Pages > Edit`

- [ ] **Get Account ID**
  - Dashboard: https://dash.cloudflare.com
  - Copy from right sidebar

### Local Testing

- [ ] **Test build locally**
  ```bash
  npm run build:cloudflare
  ```

- [ ] **Verify build output**
  - Check `dist/` directory exists
  - No build errors

## 🚀 Deployment Steps

1. **Push to master branch**
   ```bash
   git add .
   git commit -m "Setup Cloudflare deployment"
   git push origin master
   ```

2. **Monitor GitHub Actions**
   - Go to: Repository > Actions
   - Watch "Deploy to Cloudflare Pages" workflow
   - All jobs should pass: lint → unit-test → deploy → status-notification

3. **Configure Cloudflare Environment Variables**
   - Go to: Pages project > Settings > Environment variables
   - Add for **Production**:
     - [ ] `SUPABASE_URL`
     - [ ] `SUPABASE_KEY`

4. **Test Deployed Application**
   - [ ] Visit your Cloudflare Pages URL
   - [ ] Test authentication
   - [ ] Verify Supabase connection

## 🔍 Verification

### GitHub Actions
- [ ] Workflow runs successfully
- [ ] No red X marks in Actions tab
- [ ] Deployment step shows success ✅

### Cloudflare Dashboard
- [ ] New deployment appears in Pages project
- [ ] Build logs show no errors
- [ ] Application is accessible at Pages URL

### Application Health
- [ ] Homepage loads
- [ ] Authentication works
- [ ] Database queries work
- [ ] No console errors

## 📝 Quick Reference

### Build Command
```bash
npm run build:cloudflare
```

### Deploy Command (Manual)
```bash
wrangler pages deploy dist --project-name=your-project-name
```

### View Logs
```bash
# GitHub Actions
Repository > Actions > Latest workflow run

# Cloudflare
Pages project > Deployments > Latest > View logs
```

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid API token" | Regenerate token with correct permissions |
| "Project not found" | Verify `CLOUDFLARE_PROJECT_NAME` matches exactly |
| "Build failed" | Check Supabase secrets are set correctly |
| "Application errors" | Add environment variables in Cloudflare Pages |
| "Secrets not found" | Ensure secrets are in Actions (not Dependabot) |

## 🎯 Success Criteria

✅ All GitHub Actions jobs pass
✅ Deployment completes in Cloudflare
✅ Application is accessible online
✅ Authentication works
✅ Database operations work

## 📚 Documentation

- **Full Guide**: [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)
- **Complete Summary**: [DEPLOYMENT_SETUP_SUMMARY.md](./DEPLOYMENT_SETUP_SUMMARY.md)
- **Environment Template**: [.env.example](./.env.example)
- **Workflow File**: [.github/workflows/master.yml](./.github/workflows/master.yml)

---

**Ready to deploy?** Start with GitHub Secrets setup! 🚀
