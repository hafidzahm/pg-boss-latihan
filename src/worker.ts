import { boss, startBoss } from "./boss.js";

async function main() {
  try {
    await startBoss(); // awali dengan ini
    await boss.work("email.send", { batchSize: 5 }, async ([job]) => {
      const { to, subject, body } = job?.data as {
        to: string;
        subject: string;
        body: string;
      };

      console.log(`[Worker]: Job received: `, { to, subject, body });
    });
    console.log(`[Worker]: Waiting for jobs...`);
  } catch (error) {
    console.error({ error });
    process.exit(0);
  }
}
