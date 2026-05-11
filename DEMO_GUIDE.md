# CyberHex v1.0 Demo & User Guide

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- C++17 compatible compiler
- CMake 3.10+

### Quick Start with Docker

```bash
# Clone and navigate
git clone <repo>
cd CyberHex

# Start all services
docker-compose up

# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

### Local Development Setup

#### Backend
```bash
cd backend
npm install
cp ../.env.example .env
npm run start
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

#### C++ ML Engine
```bash
cd ML/models/cpp-modules
mkdir build && cd build
cmake .. && make
./unit_tests --test
```

## Features Demo

### 1. User Authentication
- Register new account: POST `/api/v1/auth/register`
- Login: POST `/api/v1/auth/login`
- Protected routes require Bearer token

### 2. Model Training
- Create experiment: POST `/api/v1/experiments`
- Real-time loss updates via WebSocket
- Visualize training on dashboard

### 3. ML Engine Capabilities
- Mini-batch training with multiple optimizers (SGD, Adam, RMSprop)
- Dense layers with He/Xavier initialization
- Activation functions: ReLU, Sigmoid, Softmax, Tanh, LeakyReLU
- Loss functions: MSE, Cross-Entropy, Binary Cross-Entropy
- Regularization: L1, L2, Dropout, BatchNormalization
- Early stopping & learning rate scheduling
- Export to ONNX format

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/profile
```

### Experiments
```
GET    /api/v1/experiments
POST   /api/v1/experiments
GET    /api/v1/experiments/{id}/logs
POST   /api/v1/experiments/{id}/logs
```

### Users
```
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
```

## Performance Benchmarks

### Matrix Operations (1000x1000)
- Sequential: ~50ms
- OpenMP (4 cores): ~15ms
- AVX2 SIMD: ~25ms

### Training (100 samples, 2 epochs)
- Simple 2-layer network: ~200ms
- With BatchNorm: ~250ms

## Security Features

- JWT token-based authentication
- Bcrypt password hashing
- CORS origin whitelist
- Helmet security headers
- Rate limiting (200 req/15min)
- NoSQL injection prevention
- HTTP-only cookie storage
- Input validation on all endpoints

## Troubleshooting

### WebSocket Connection Issues
- Ensure backend is running on port 5000
- Check CORS_ORIGINS in .env
- Browser console for connection errors

### Database Connection
- Verify MongoDB is running: `mongo --version`
- Check DB_URI connection string
- Review logs: `tail -f logs/error.log`

### Build Failures (C++)
- Ensure CMake 3.10+: `cmake --version`
- Check compiler: `g++ --version`
- OpenMP optional: builds without if not found

## Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd ../client && npm test

# C++ unit tests
cd ../ML/models/cpp-modules/build && ./unit_tests --test
```

## Deployment

Use docker-compose for production:
```bash
docker-compose -f docker-compose.yml up -d
```

For Kubernetes, convert using Kompose:
```bash
kompose convert -f docker-compose.yml
kubectl apply -f *.yaml
```

## Support & Documentation

- API Docs: `openapi.yaml` (use Swagger UI)
- C++ Docs: Generated via Doxygen in `ML/models/cpp-modules/docs/`
- Issues: GitHub Issues tracker
- Releases: Semantic versioning in VERSIONING.md