import PgBoss from "pg-boss";

const DATABASE_URL = process.env.DATABASE_URL as string;

const boss = new PgBoss({
  connectionString: DATABASE_URL,
});

async function startBoss() {
  boss.on("error", (error) => console.log({ error })); //setelah buat instance, sebelum start
  boss.start;
}
