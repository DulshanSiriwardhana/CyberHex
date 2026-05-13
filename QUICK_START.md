# Quick Start Guide - CyberHex v1.0

## Prerequisites
- Node.js 18+
- MongoDB 7+
- Docker & Docker Compose (optional, for containerized setup)
- Python 3.11+ (for ML modules)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Backend setup
cd backend
npm install

# Client setup
cd ../client
npm install
```

### 2. Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env  # or use your editor
```

**Minimum required values:**
```env
DB_URI=mongodb://localhost:27017/cyberhex
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

### 3. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name cyberhex-mongo mongo:7-alpine

# Or if MongoDB is installed locally
mongod --dbpath /path/to/data
```

### 4. Start Backend

```bash
cd backend
npm run dev  # Starts on http://localhost:5000
```

### 5. Start Frontend (in new terminal)

```bash
cd client
npm run dev  # Starts on http://localhost:5173
```

### 6. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1
- Health Check: http://localhost:5000/api/v1/health

---

## Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services will be available at:**
- Frontend: http://localhost
- Backend API: http://localhost/api/v1
- MongoDB: localhost:27017

---

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

### Linting

```bash
# Backend
cd backend
npm run lint        # Check
npm run lint:fix    # Fix issues
npm run format      # Format code

# Frontend
cd client
npm run lint        # Check
npm run lint:fix    # Fix issues
npm run format      # Format code
```

---

## API Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Create Experiment

```bash
curl -X POST http://localhost:5000/api/v1/experiments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My Experiment",
    "description": "Test experiment",
    "config": {
      "modelType": "neural_network",
      "parameters": {"layers": 3}
    }
  }'
```

---

## Environment Variables Reference

```env
# Database
DB_URI=mongodb://localhost:27017/cyberhex

# JWT
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
LOG_LEVEL=info

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:8000

# Frontend
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000/api/v1/ws
```

---

## Troubleshooting

### Cannot connect to MongoDB
- Ensure MongoDB is running: `mongosh`
- Check `DB_URI` in `.env`
- Verify port 27017 is not blocked

### Frontend cannot reach backend
- Check backend is running on port 5000
- Verify `VITE_API_BASE_URL` is correct
- Check CORS settings

### Port already in use
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Find and kill process on port 5173
lsof -i :5173
kill -9 <PID>
```

### Docker issues
```bash
# Clear Docker cache
docker builder prune

# Remove old containers
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

---

## Performance Tips

1. **Database Indexing**
   - Ensure MongoDB indices are created
   - Use aggregation pipeline for complex queries

2. **Frontend Optimization**
   - Enable lazy loading for routes
   - Use React.memo for expensive components
   - Implement virtual scrolling for large lists

3. **Backend Optimization**
   - Enable response caching
   - Use connection pooling
   - Implement request batching

---

## Security Checklist

Before production deployment:

- [ ] Change all default secrets and keys
- [ ] Set `NODE_ENV=production`
- [ ] Configure strong `JWT_SECRET`
- [ ] Enable HTTPS/SSL
- [ ] Set appropriate CORS origins
- [ ] Enable database authentication
- [ ] Configure firewall rules
- [ ] Set up error tracking (Sentry)
- [ ] Enable rate limiting
- [ ] Configure backups

---

## Next Steps

1. **Read Full Documentation**
   - See `RELEASE_NOTES_v1.0.md` for detailed features

2. **Explore the Codebase**
   - Backend: `backend/` directory
   - Frontend: `client/src/` directory
   - Models: `backend/models/`
   - Routes: `backend/routes/`
   - Components: `client/src/components/`

3. **Deploy to Production**
   - Use Docker Compose or Kubernetes
   - Configure CI/CD pipeline
   - Set up monitoring and alerting

4. **Extend with Custom Features**
   - Add new API endpoints
   - Create custom React components
   - Integrate ML models

---

## Getting Help

- Check logs: `npm run dev` shows detailed logs
- See error messages: Check browser console and backend logs
- Review tests: Look at test files for usage examples
- Reference ESLint: Check `.eslintrc` files for code style

---

## Links

- [Backend README](./backend/README.md)
- [Frontend README](./client/README.md)
- [Release Notes](./RELEASE_NOTES_v1.0.md)
- [GitHub Actions Workflow](./.github/workflows/ci.yml)

Happy coding! 🚀
