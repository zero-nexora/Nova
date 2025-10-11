import { useGetSuggest } from "@/app/(client)/hooks/products/use-get-suggest";
import { Skeleton } from "@/components/ui/skeleton";

// Interface for props
interface SearchSuggestionsProps {
  debouncedSearchQuery: string;
  recentSearches: string[];
  selectedIndex: number;
  onSuggestionClick: (item: string) => void;
  onMouseEnter: (item: string) => void;
  onMouseLeave: () => void;
}

const highlightText = (text: string, query: string) => {
  if (!query) return text;
  const regex = new RegExp(
    `(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-bold">
        {part}
      </span>
    ) : (
      <span key={i} className="text-muted-foreground">
        {part}
      </span>
    )
  );
};

function LoadingSuggestions() {
  return (
    <div className="p-2 space-y-2">
      {[...Array(7)].map((_, i) => (
        <Skeleton key={i} className="h-6 w-full rounded-md" />
      ))}
    </div>
  );
}

function ErrorSuggestions() {
  return (
    <div className="p-4 text-center text-sm text-destructive">
      Error suggestions
    </div>
  );
}

interface SuggestionsListProps {
  items: string[];
  selectedIndex: number;
  onSuggestionClick: (item: string) => void;
  onMouseEnter: (item: string) => void;
  onMouseLeave: () => void;
  debouncedSearchQuery: string;
  title: string;
}
function SuggestionsList({
  items,
  selectedIndex,
  onSuggestionClick,
  onMouseEnter,
  onMouseLeave,
  debouncedSearchQuery,
  title,
}: SuggestionsListProps) {
  return (
    <div className="p-2" onMouseLeave={onMouseLeave}>
      <div className="text-xs font-medium text-muted-foreground px-2 py-1">
        {title}
      </div>
      {items.map((item, index) => (
        <button
          type="button"
          key={item}
          onClick={() => onSuggestionClick(item)}
          onMouseEnter={() => onMouseEnter(item)}
          className={`w-full text-left px-2 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm transition-colors cursor-pointer ${
            index === selectedIndex ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <div className="flex items-center">
            {highlightText(item, debouncedSearchQuery)}
          </div>
        </button>
      ))}
    </div>
  );
}

function NoSuggestions({
  debouncedSearchQuery,
}: {
  debouncedSearchQuery: string;
}) {
  return (
    <div className="p-4 text-center text-sm text-muted-foreground">
      No products found for &quot;{debouncedSearchQuery}&quot;
    </div>
  );
}

function EmptySuggestions() {
  return (
    <div className="p-4 text-center text-sm text-muted-foreground">
      Start typing to see suggestions
    </div>
  );
}

export function SearchSuggestions({
  debouncedSearchQuery,
  recentSearches,
  selectedIndex,
  onSuggestionClick,
  onMouseEnter,
  onMouseLeave,
}: SearchSuggestionsProps) {
  const { suggest, isPending, error } = useGetSuggest({
    search: debouncedSearchQuery,
  });

  const isSearching = debouncedSearchQuery.trim().length > 0;
  const title = isSearching ? "Suggestions" : "Recent Searches";

  if (isSearching && isPending) {
    return <LoadingSuggestions />;
  }

  if (error) {
    return <ErrorSuggestions />;
  }

  if (isSearching && suggest.length > 0) {
    return (
      <SuggestionsList
        items={suggest}
        selectedIndex={selectedIndex}
        onSuggestionClick={onSuggestionClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        debouncedSearchQuery={debouncedSearchQuery}
        title={title}
      />
    );
  }

  if (isSearching && suggest.length === 0) {
    return <NoSuggestions debouncedSearchQuery={debouncedSearchQuery} />;
  }

  if (recentSearches.length > 0) {
    return (
      <SuggestionsList
        items={recentSearches}
        selectedIndex={selectedIndex}
        onSuggestionClick={onSuggestionClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        debouncedSearchQuery={debouncedSearchQuery}
        title={title}
      />
    );
  }

  return <EmptySuggestions />;
}
