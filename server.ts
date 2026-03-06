import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'gizli-anahtar';

// 1. Kayıt Ol
app.post('/register', async (req, res) => {
  const { email, password, firstName } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName }
    });
    res.json({ message: "Kullanıcı oluşturuldu", userId: user.id });
  } catch (e) {
    res.status(400).json({ error: "Email zaten kayıtlı" });
  }
});

// 2. Giriş Yap
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && await bcrypt.compare(password, user.passwordHash)) {
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token, user: { email: user.email, firstName: user.firstName } });
  } else {
    res.status(401).json({ error: "Hatalı giriş" });
  }
});

// 3. Dashboard Özeti
app.get('/dashboard', async (req, res) => {
  // Basitçe tüm varlıkları çekme örneği
  const accounts = await prisma.account.findMany();
  res.json({ accounts });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda hazır!`));