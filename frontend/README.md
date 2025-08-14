# Sweet Heaven Frontend

## Overview

This is the frontend for Sweet Heaven, a cake-selling business. It uses React (Vite), Tailwind CSS, Stripe, Cloudinary, and React Three Fiber for the 3D cake creator.

## Folder Structure

- `src/components/`: Reusable UI parts (Navbar, ProductCard, Cart, etc.)
- `src/pages/`: Main pages (Home, Products, CustomCake, Cart, Checkout, Admin)
- `src/assets/`: Images, icons, 3D model
- `src/hooks/`: Custom React hooks
- `App.jsx`: Main app component, sets up routes
- `main.jsx`: Entry point for React
- `index.css`: Tailwind and global styles
- `.env.example`: Shows required environment variables

## Step-by-Step Guide

### 1. Clone the Repo

```
git clone <repo-url>
cd Sweet_Heaven/frontend
```

### 2. Install Dependencies

```
npm install
```

### 3. Set Up Tailwind CSS

- Already configured in this template.

### 4. Set Up Stripe

- Go to [Stripe](https://dashboard.stripe.com/register) and get your test public key. Add to `.env`.

### 5. Set Up Cloudinary

- Go to [Cloudinary](https://cloudinary.com/) and create a free account.
- Get your upload preset. Add to `.env`.

### 6. Add Environment Variables

- Copy `.env.example` to `.env` and fill in your values.

### 7. Run Locally

```
npm run dev
```

### 8. Deploy to Vercel

- Follow [Vercel React guide](https://vercel.com/docs/concepts/frameworks/react) to deploy.

## Updating Products, Prices, Discounts

- Use the admin panel or update via backend API.

## Updating 3D Model

- The custom cake creator loads the model from a public URL. To change, update the URL in the code.

## Architecture Diagram

![MERN Architecture](../docs/mern-architecture.png)

## Data Flow Diagram

![Data Flow](../docs/data-flow.png)

---

For more details, see code comments in each file.
