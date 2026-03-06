import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import exportRoutes from "./routes/exportRoutes";
import reportRoutes from "./routes/reportRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "gelirtakibi_user",
  password: "Alpasya2305925@",
  database: "gelirtakibi_db"
});

db.connect((err) => {
  if (err) {
    console.log("Database bağlantı hatası:", err);
  } else {
    console.log("Database bağlandı");
  }
});


dotenv.config();

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

/* 404 HANDLER */

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint bulunamadı"
  });
});

/* GLOBAL ERROR HANDLER */

app.use((err: any, req: any, res: any, next: any) => {

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
Mode: ${process.env.NODE_ENV || "development"}
`);

});


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