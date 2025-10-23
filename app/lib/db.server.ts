import { PrismaClient } from "@prisma/client";

// Singleton pattern untuk Prisma Client
// Penting untuk development agar tidak membuat terlalu banyak koneksi
declare global {
  var __db: PrismaClient | undefined;
}

let db: PrismaClient;

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
  }
  db = global.__db;
}

export { db };
