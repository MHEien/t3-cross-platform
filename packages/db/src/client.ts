import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { env } from "../env";

import * as schema from "./schema";

export { schema };

const client = new Client({
  connectionString: env.POSTGRES_URL,
});

await client.connect();

export const db = drizzle(client, { schema });
