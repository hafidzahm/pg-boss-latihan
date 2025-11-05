import { boss, startBoss } from "./boss.js";
const attempts = new Map<string, number>(); // inisialisasi attempts
async function main() {
  try {
    await startBoss(); // awali dengan ini
    await boss.work("email.send", { batchSize: 5 }, async ([job]) => {
      // const { to, subject, body } = job?.data as {
      //   to: string;
      //   subject: string;
      //   body: string;
      // };
      // console.log(`[Worker]: Job received: `, { to, subject, body });

      // simulasi fail 2x
      const jobId = job?.id as string;
      const number = (attempts.get(jobId) ?? 0) + 1; // cari apakah job id sudah ada, kalo udah ada tambah number += 1
      if (number < 3) {
        //kalo number kurang dari 3
        console.log(`Simulate fail for jobId: ${job?.id} on number ${number}`);
        throw new Error(
          `Simulate fail for jobId: ${job?.id} on number ${number}`
        );
      }

      console.log(`Job received: ${job?.data}`);
    });
    console.log(`[Worker]: Waiting for jobs...`);
  } catch (error) {
    console.error({ error });
    process.exit(0);
  }
}

await main();
