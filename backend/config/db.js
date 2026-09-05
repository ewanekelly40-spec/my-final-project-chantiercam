import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "chantiercam",
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true,
  multipleStatements: true,
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Initialize Database & Tables automatically on start
export async function initDatabase() {
  let tempConn;
  try {
    // 1. Create database if not exists
    tempConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true,
    });

    await tempConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );

    // 2. Read and run schema.sql directly on tempConn with USE database
    const schemaPath = path.join(__dirname, "..", "scripts", "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf-8");
      await tempConn.query(`USE \`${dbConfig.database}\`;\n` + sql);
      console.log(`[MySQL] Database "${dbConfig.database}" and tables verified successfully.`);
    }

    await tempConn.end();
  } catch (err) {
    if (tempConn) {
      try {
        await tempConn.end();
      } catch (e) {}
    }
    console.error("[MySQL] Database initialization error:", err.message);
    throw err;
  }
}

export default pool;
