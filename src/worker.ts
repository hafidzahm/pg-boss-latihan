import { boss, startBoss } from "./boss.js";

async function main() {
  try {
    await startBoss(); // awali dengan ini
    console.log(`[Worker]: Waiting for jobs...`);
    await boss.work("email.send", { batchSize: 5 }, async ([job]) => {
      const { to, subject, body } = job?.data as {
        to: string;
        subject: string;
        body: string;
      };

      console.log(`[Worker]: Job received: `, { to, subject, body });
    });

    //worker dengan cron
    await boss.createQueue("email.daily"); //buat dulu nama antrian
    await boss.schedule("email.daily", "*/1 * * * *", { scope: "all" }); // setiap 1 menit
    console.log("[Cron] email.daily scheduled every minute");

    // worker untuk digest
    await boss.work("email.daily", async ([job]) => {
      const now = new Date().toLocaleTimeString();
      console.log(
        `Worker cron running with data: ${JSON.stringify(
          job?.data
        )} time: ${now}`
      );
    });
  } catch (error) {
    console.error({ error });
    process.exit(0);
  }
}

await main();
