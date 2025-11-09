# ----- Build stage -----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Build
COPY . .
# If you use env-based API URL, set it via build-arg, e.g.:
# ARG REACT_APP_API_BASE
# ENV REACT_APP_API_BASE=$REACT_APP_API_BASE
RUN npm run build

# ----- Serve stage -----
FROM nginx:alpine
# Copy build output to nginx web root
COPY --from=build /app/build /usr/share/nginx/html
# Optional: custom SPA routing config (see below)
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
