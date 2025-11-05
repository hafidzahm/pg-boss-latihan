import pgPromise from "pg-promise";

const DATABASE_URL = process.env.DATABASE_URL as string;
const pgp = pgPromise();
export const db = pgp(DATABASE_URL);
