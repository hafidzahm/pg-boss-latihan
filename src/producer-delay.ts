import { boss, startBoss } from "./boss.js";

async function main() {
  try {
    await startBoss(); //prepares job and job monitoring
    await boss.createQueue("email.send"); // create queue
    console.log("Awaiting jobs....");

    const id = await boss.send(
      "email.send",
      {
        to: "delay@contoh.com",
        subject: "Delay 5 detik",
        body: "Halo delay!",
      },
      {
        startAfter: "5 seconds", //mulai setelah 5 detik kemudian
        retryLimit: 3, //batas retry
        retryDelay: 2, // delay antar retry dalam detik
        retryBackoff: true, // enable exponential retry based on retryDelay 2, 4, 6, 8
      }
    );

    console.log(`Enqueued delayed jobId: ${id}`);
    process.exit(0);
  } catch (error) {
    console.log({ error });
    process.exit(1);
  }
}
