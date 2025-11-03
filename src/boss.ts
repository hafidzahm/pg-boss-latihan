import PgBoss from "pg-boss";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL as string;

export const boss = new PgBoss({
  connectionString: DATABASE_URL,
});

export async function startBoss() {
  boss.on("error", (error) => console.log({ error })); //setelah buat instance, sebelum start
  await boss.start(); //wajib untuk starting, prepare database tujuan dan nyalain job monitoring
  console.log("[pg-boss] started ✅");
}
