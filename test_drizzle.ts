import "dotenv/config";
import { db, entries, users } from "./packages/db/src";
import { desc } from "drizzle-orm";

async function testDrizzle() {
  console.log("Testing Drizzle ORM connection...\n");

  try {
    // Test 1: Count entries
    const entryCount = await db.select().from(entries);
    console.log(`✓ Total entries: ${entryCount.length}`);

    // Test 2: Get latest entry
    const latestEntry = await db
      .select()
      .from(entries)
      .orderBy(desc(entries.createdAt))
      .limit(1);

    if (latestEntry.length > 0) {
      console.log(`✓ Latest entry: ID=${latestEntry[0].id}, Title='${latestEntry[0].title.substring(0, 30)}...'`);
    }

    // Test 3: Count users
    const usersList = await db.select().from(users);
    console.log(`✓ Total users: ${usersList.length}`);

    console.log("\n✓ Drizzle ORM setup successful!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error:", error);
    process.exit(1);
  }
}

testDrizzle();
