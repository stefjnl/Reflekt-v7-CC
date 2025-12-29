"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchFormProps {
  initialQuery?: string;
  initialYear?: string;
  initialFrom?: string;
  initialTo?: string;
}

export function SearchForm({
  initialQuery = "",
  initialYear = "all",
  initialFrom = "",
  initialTo = "",
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [year, setYear] = useState(initialYear);
  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);

  // Generate year options (2014-2025 based on 11+ year history)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2014; y--) {
    years.push(y);
  }

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 500);

    return () => clearTimeout(timer);
  }, [query, year, fromDate, toDate]);

  const updateURL = () => {
    const params = new URLSearchParams();

    if (query) params.set("q", query);
    if (year && year !== "all") params.set("year", year);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);

    // Reset to page 1 when filters change
    const queryString = params.toString();
    router.push(queryString ? `/entries?${queryString}` : "/entries");
  };

  const clearFilters = () => {
    setQuery("");
    setYear("all");
    setFromDate("");
    setToDate("");
    router.push("/entries");
  };

  const hasFilters = query || (year && year !== "all") || fromDate || toDate;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search entries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            From:
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex flex-1 items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            To:
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
