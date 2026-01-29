import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL is not defined in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function backupTable(tableName: string, backupDir: string) {
  console.log(`📦 Backing up ${tableName}...`);
  
  try {
    // Query all documents from the table
    // @ts-expect-error - Dynamic table access
    const data = await client.query(api.debug[`getAll${tableName.charAt(0).toUpperCase() + tableName.slice(1)}`]);
    
    const filename = path.join(backupDir, `${tableName}.json`);
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    
    console.log(`✅ Backed up ${tableName}: ${data?.length || 0} records`);
    return data?.length || 0;
  } catch (error) {
    console.warn(`⚠️  Could not backup ${tableName}:`, error);
    return 0;
  }
}

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const backupDir = path.join(process.cwd(), "backups", `schema-migration-${timestamp}`);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  console.log(`🔒 Starting database backup to: ${backupDir}\n`);
  
  const tables = [
    "users",
    "studentProfile",
    "userPreferences",
    "bookmarks",
    "courses",
    "weeks",
    "videos",
    "videoProgress",
    "videoNotes",
  ];
  
  const stats: Record<string, number> = {};
  
  for (const table of tables) {
    stats[table] = await backupTable(table, backupDir);
  }
  
  // Write backup metadata
  const metadata = {
    timestamp: new Date().toISOString(),
    convexUrl: CONVEX_URL,
    tables: stats,
    totalRecords: Object.values(stats).reduce((sum, count) => sum + count, 0),
  };
  
  fs.writeFileSync(
    path.join(backupDir, "_metadata.json"),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log("\n📊 Backup Summary:");
  console.log("==================");
  Object.entries(stats).forEach(([table, count]) => {
    console.log(`${table.padEnd(20)} ${count} records`);
  });
  console.log("==================");
  console.log(`Total: ${metadata.totalRecords} records`);
  console.log(`\n✨ Backup completed successfully!`);
  console.log(`📁 Location: ${backupDir}`);
}

backup().catch(console.error);
