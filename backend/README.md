# Sweet Heaven Backend

## Overview

This is the backend for Sweet Heaven, a cake-selling business. It uses Node.js, Express, MongoDB Atlas, Cloudinary, and Stripe.

## Folder Structure

- `controllers/`: Handles API logic for products, orders, users, promotions.
- `models/`: MongoDB schemas for Users, Products, Orders, Promotions.
- `routes/`: API endpoints for each resource.
- `middleware/`: Auth and error handling.
- `utils/`: Helpers (e.g., Cloudinary upload).
- `.env.example`: Shows required environment variables.
- `server.js`: Main entry point.

## Step-by-Step Guide

### 1. Clone the Repo

```
git clone <repo-url>
cd Sweet_Heaven/backend
```

### 2. Install Dependencies

```
npm install
```

### 3. Set Up MongoDB Atlas

- Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and create a free cluster.
- Get your connection string and add it to `.env`.

### 4. Set Up Cloudinary

- Go to [Cloudinary](https://cloudinary.com/) and create a free account.
- Get your cloud name, API key, and secret. Add to `.env`.

### 5. Set Up Stripe

- Go to [Stripe](https://dashboard.stripe.com/register) and get your test API keys. Add to `.env`.

### 6. Add Environment Variables

- Copy `.env.example` to `.env` and fill in your values.

### 7. Run Locally

```
npm start
```

### 8. Deploy to Render

- Follow [Render Node.js guide](https://render.com/docs/deploy-node-express-app) to deploy.

## API Endpoints

- `/api/products`: Get/add/edit/delete products
- `/api/orders`: Place and track orders
- `/api/users`: Register/login
- `/api/promotions`: Manage discounts

## Updating Products, Prices, Discounts

- Use the admin panel (see frontend docs) or API endpoints.

## Updating 3D Model

- The frontend loads the model from a public URL. To change, update the URL in frontend code.

## Architecture Diagram

![MERN Architecture](../docs/mern-architecture.png)

## Data Flow Diagram

![Data Flow](../docs/data-flow.png)

---

For more details, see code comments in each file.
