// scripts/sync-db.ts — Create all tables in MySQL
import { connectDB } from '../lib/db';
import { syncModels } from '../models';

async function main() {
  await connectDB();
  await syncModels(false); // false = don't drop existing tables
  console.log('✅ Database synced successfully');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
