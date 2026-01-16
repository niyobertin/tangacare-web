# Deploying TangaCare Web to Vercel

This project is configured for easy deployment on [Vercel](https://vercel.com).

## 1. Prerequisites
- A Vercel account.
- The project pushed to a GitHub/GitLab/Bitbucket repository.

## 2. Configuration Files Added
- `vercel.json`: Handles SPA routing (ensures that deep links like `/dashboard` work correctly on refresh).
- `.env.example`: Template for environment variables.

## 3. How to Deploy
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** > **Project**.
3. Import your repository.
4. Vercel should automatically detect **Vite** as the Framework Preset.
5. **Environment Variables**:
   - Expand the "Environment Variables" section.
   - Add `VITE_API_URL` with the URL of your production backend (e.g., `https://api.tangacare.com/api`).
6. Click **Deploy**.

## 4. Local Testing
To test the production build locally:
```bash
yarn build
yarn preview
```
