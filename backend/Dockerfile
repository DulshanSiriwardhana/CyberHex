FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:18-alpine

WORKDIR /app

# Python + NumPy for ML_ENGINE=python training and inference
RUN apk add --no-cache dumb-init python3 py3-pip \
    && pip3 install --no-cache-dir numpy --break-system-packages

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
