# Phase 5: Deployment, Scaling & Production

## Objective
Take the application from a local development environment to a robust, publicly accessible production server.

## 1. Dockerization
- Create optimized, multi-stage `Dockerfile`s for every component:
  - Next.js Web App
  - FastAPI Backend
  - `gemini-web2api` (Proxy)
- Consolidate everything into a master `docker-compose.prod.yml` that handles networking between services.

## 2. Reverse Proxy & SSL
- Set up **Nginx** or **Traefik** as the API Gateway/Reverse Proxy.
- Route `/api/*` traffic to the FastAPI container.
- Route `/` traffic to the Next.js container.
- **CRITICAL SECURITY:** Ensure the `gemini-web2api` port (8081) is securely blocked from the public internet. It should only be accessible internally by the FastAPI backend over the Docker network.
- Automatically provision SSL certificates using Let's Encrypt (Certbot) for secure HTTPS connections.

## 3. CI/CD Pipeline
- Set up GitHub Actions workflows.
- On push to `main` branch:
  - Run linters and tests.
  - Build Docker images.
  - SSH into the production VPS (e.g., DigitalOcean, Hetzner, AWS EC2).
  - Pull new images and restart the containers.

## 4. Performance & Monitoring
- Implement rate limiting via Redis in Nginx/FastAPI to protect against DDoS attacks and abuse.
- Monitor `gemini-web2api` logs to ensure Google isn't blocking the IP; consider configuring the proxy setting in `config.json` to route traffic through rotating residential proxies if usage across your platform becomes extremely high.
- Setup Prometheus and Grafana for comprehensive system health and database monitoring.
