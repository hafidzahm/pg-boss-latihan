import { boss, startBoss } from "./boss.js";
import { db } from "./db.js";

async function main() {
  try {
    await startBoss(); //awali dengan ini
    await boss.createQueue("email-send"); //bikin antrian

    const data = {
      to: "idempoten-dengan-delay2@contoh.com",
      subject: "Halo",
      body: "Contoh idempoten",
    };

    //kunci idempoten (unique key)
    const key = `verify:${data.to}`;

    await db.none(`
      CREATE TABLE IF NOT EXISTS public.email_events (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.none(`
      CREATE INDEX IF NOT EXISTS idx_email_events_key ON public.email_events(key)
    `);

    // SATU query atomik: insert kalau belum ada; RETURNING hanya muncul kalau benar2 baru
    const res = await db.oneOrNone(
      `INSERT INTO public.email_events(key)
     VALUES($1)
     ON CONFLICT DO NOTHING
     RETURNING 1 AS inserted`,
      [key]
    );

    if (!res) {
      console.log(`Skip duplicate key: ${key}`);
      return;
    }

    const id = await boss.send("email.send", data, {
      retryLimit: 2,
      retryDelay: 2,
      retryBackoff: true,
    });

    console.log(`Enqueued job (first job only): ${id}`);
    process.exit(0);
  } catch (error) {
    console.log({ error });
    process.exit(1);
  }
}

await main();
