# ═══════════════════════════════════════════════
# Multi-stage build: Node builds Angular → nginx serves it
# Works on: AWS ECS/Fargate, Azure Container Apps, GCP Cloud Run
# ═══════════════════════════════════════════════

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/dealersense-admin/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
