import { boss, startBoss } from "./boss.js";

async function main() {
  try {
    await startBoss(); // mulai job dan monitoring
    await boss.createQueue("email.send"); //bikin dulu 'barisan antrian'
    const jobId = await boss.send("email.send", {
      to: "email@tujuan.com",
      subject: "Email Test",
      body: "Test test test",
    });

    console.log(`Enqueued jobs jobId: ${jobId}`);
  } catch (error) {
    console.error({ error });
    process.exit(0);
  } finally {
    process.exit(0);
  }
}

await main();
