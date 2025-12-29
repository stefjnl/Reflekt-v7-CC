import { auth } from "@/lib/auth";
import { db, entries } from "@reflekt/db";
import { eq, desc, ilike, or, and, gte, lt, lte, count } from "drizzle-orm";
import { EntryCard } from "@/components/entries/entry-card";
import { Pagination } from "@/components/entries/pagination";
import { SearchForm } from "@/components/entries/search-form";

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    q?: string;
    year?: string;
    from?: string;
    to?: string;
  };
}) {
  const session = await auth();

  if (!session) {
    return null;
  }

  const userId = parseInt(session.user.id!);
  const page = parseInt(searchParams.page || "1");
  const query = searchParams.q;
  const year = searchParams.year;
  const fromDate = searchParams.from;
  const toDate = searchParams.to;

  // Build filter conditions
  const conditions = [eq(entries.userId, userId)];

  // Search filter
  if (query) {
    conditions.push(
      or(
        ilike(entries.title, `%${query}%`),
        ilike(entries.content, `%${query}%`)
      )!
    );
  }

  // Year filter
  if (year && year !== "all") {
    const yearNum = parseInt(year);
    const yearStart = new Date(yearNum, 0, 1);
    const yearEnd = new Date(yearNum + 1, 0, 1);
    conditions.push(gte(entries.createdAt, yearStart));
    conditions.push(lt(entries.createdAt, yearEnd));
  }

  // Date range filter
  if (fromDate) {
    conditions.push(gte(entries.createdAt, new Date(fromDate)));
  }
  if (toDate) {
    const toDateEnd = new Date(toDate);
    toDateEnd.setHours(23, 59, 59, 999);
    conditions.push(lte(entries.createdAt, toDateEnd));
  }

  const whereClause = and(...conditions);

  // Get total count
  const [{ count: total }] = await db
    .select({ count: count() })
    .from(entries)
    .where(whereClause);

  // Get paginated entries
  const entryList = await db.query.entries.findMany({
    where: whereClause,
    orderBy: [desc(entries.createdAt)],
    limit: 20,
    offset: (page - 1) * 20,
  });

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Entries</h1>

      <SearchForm
        initialQuery={query}
        initialYear={year}
        initialFrom={fromDate}
        initialTo={toDate}
      />

      {entryList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {query || year || fromDate || toDate ? (
            <p>No entries found matching your search criteria.</p>
          ) : (
            <p>No entries yet. Create your first entry!</p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {entryList.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
