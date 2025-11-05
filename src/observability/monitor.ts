import "dotenv/config";
import { db } from "../db.js";

async function snapshot() {
  const overview = await db.any(`
    SELECT
      name AS queue,
      COUNT(*) FILTER (WHERE state='created' AND start_after <= NOW()) AS waiting,
      COUNT(*) FILTER (WHERE state='created' AND start_after > NOW())  AS scheduled,
      COUNT(*) FILTER (WHERE state='active')    AS active,
      COUNT(*) FILTER (WHERE state='retry')     AS retrying,
      COUNT(*) FILTER (WHERE state='failed')    AS failed
    FROM pgboss.job
    GROUP BY name
    ORDER BY queue
  `);

  console.log("\n=== Queue Overview ===");
  console.table(overview);

  const retrying = await db.any(`
    SELECT id, name, retry_count, retry_limit, last_error, start_after
    FROM pgboss.job
    WHERE state='retry'
    ORDER BY retry_count DESC, start_after ASC
    LIMIT 20
  `);

  console.log("=== Retrying (top) ===");
  console.table(
    retrying.map((r) => ({
      id: r.id,
      name: r.name,
      retry: `${r.retry_count}/${r.retry_limit}`,
      start_after: r.start_after,
    }))
  );

  const failed = await db.any(`
    SELECT id, name, retry_count, retry_limit, completed_on, last_error
    FROM pgboss.job
    WHERE state='failed'
    ORDER BY completed_on DESC
    LIMIT 20
  `);

  console.log("=== Failed (recent) ===");
  console.table(
    failed.map((f) => ({
      id: f.id,
      name: f.name,
      retry: `${f.retry_count}/${f.retry_limit}`,
      completed_on: f.completed_on,
    }))
  );
}

const intervalMs = 30_000;
console.log(`[monitor] running every ${intervalMs / 1000}s…`);
await snapshot();
const t = setInterval(snapshot, intervalMs);

// graceful stop
for (const s of ["SIGINT", "SIGTERM"] as const) {
  process.on(s, () => {
    console.log(`[monitor] ${s} received. bye.`);
    clearInterval(t);
    process.exit(0);
  });
}
