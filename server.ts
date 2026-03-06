import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
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
  res.json({ status: "healthy" });
});

/* REGISTER */
app.post("/register", async (req, res) => {
  try {
    const { email, password, firstName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email ve şifre gerekli" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName
      }
    });

    res.json({
      message: "Kullanıcı oluşturuldu",
      userId: user.id
    });

  } catch (error) {
    res.status(400).json({
      error: "Email zaten kayıtlı olabilir"
    });
  }
});

/* LOGIN */
app.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return res.status(401).json({ error: "Hatalı şifre" });
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        email: user.email,
        firstName: user.firstName
      }
    });

  } catch (error) {
    res.status(500).json({
      error: "Giriş yapılırken hata oluştu"
    });
  }
});

/* DASHBOARD */
app.get("/dashboard", async (req, res) => {
  try {

    const accounts = await prisma.account.findMany();

    res.json({
      accounts
    });

  } catch (error) {
    res.status(500).json({
      error: "Dashboard verisi alınamadı"
    });
  }
});

/* SERVER START */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});