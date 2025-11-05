import BookingRoute from './routes/booking.Routes.js';
import UserRoute from './routes/user.Routes.js';
import ItemRoute from './routes/item.Route.js';
import HoleRoute from './routes/hole.Route.js';
import CaddyRoute from './routes/caddy.Route.js';
import StripeRoute from './routes/stripe.Route.js';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSwagger } from "./swagger.js";
import cookieParser from 'cookie-parser';
import Stripe from 'stripe';
import listEndpoints from "express-list-endpoints";
dotenv.config();
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const DB_URL = process.env.DB_URL;

const app = express();
try {
    mongoose.connect(DB_URL);
    console.log("Connect to Mongo DB Successfully");
  } catch (error) {
    console.log("DB Connection Failed");
  }

app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE']}));
app.use("/api/stripe", StripeRoute);  
app.use(express.json());  

app.use((req, _res, next) => {
  console.log("REQ", req.method, req.originalUrl);
  next();
});

app.use("/api/booking", BookingRoute);
app.use("/api/user", UserRoute);
app.use("/api/item", ItemRoute);
app.use("/api/hole", HoleRoute);
app.use("/api/caddy", CaddyRoute);
setupSwagger(app);

app.get("/_ping", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString(), version: process.env.RENDER_GIT_COMMIT || "no-commit" });
});

app.get("/_routes", (_req, res) => {
  res.json(listEndpoints(app));
});

app.get("/", (req, res) => {
  res.send("Backend is running PORT 5000");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{console.log(`Server running on port ${PORT}`)})