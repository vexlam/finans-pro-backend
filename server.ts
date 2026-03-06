import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import exportRoutes from "./routes/exportRoutes";
import reportRoutes from "./routes/reportRoutes";
import transactionRoutes from "./routes/transactionRoutes";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

dotenv.config();

const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ROOT TEST */

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Finans Pro Backend",
    version: "1.0"
  });
});

/* HEALTH CHECK */

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime()
  });
});

/* API ROUTES */

app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/reports", reportRoutes);
app.use("/transactions", transactionRoutes);
app.use("/export", exportRoutes);

/* 404 */

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint bulunamadı"
  });
});

/* ERROR HANDLER */

app.use((err, req, res, next) => {

  console.error("Server error:", err);

  res.status(500).json({
    error: "Sunucu hatası oluştu"
  });

});

/* SERVER START */

app.listen(PORT, () => {

  console.log(`
🚀 FinansPro Backend Başladı
Port: ${PORT}
`);

});

/* ADMIN CREATE */

async function createAdmin() {

  const existing = await prisma.user.findUnique({
    where: { email: "admin@gelirtakibi.com" }
  });

  if (!existing) {

    const passwordHash = await bcrypt.hash("123456", 10);

    await prisma.user.create({
      data: {
        email: "admin@gelirtakibi.com",
        passwordHash,
        firstName: "Admin"
      }
    });

    console.log("Admin user created");
  }

}

createAdmin();