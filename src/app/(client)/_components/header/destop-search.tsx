import { useState, useRef, useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductFilters } from "@/app/(client)/hooks/products/use-product-fillters";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchSuggestions } from "./search-suggestions";
import { useGetSuggest } from "../../hooks/products/use-get-suggest";
import { DEBOUNCEDSEARCH } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DesktopSearch() {
  const { filters, setFilters } = useProductFilters();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(filters.search || "");
  const [previewValue, setPreviewValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(inputValue, DEBOUNCEDSEARCH);

  const { suggest } = useGetSuggest({ search: debouncedSearchQuery });

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    setInputValue(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const newList = [query, ...prev.filter((q) => q !== query)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(newList));
      return newList;
    });
  }, []);

  const resetSearchUI = useCallback(() => {
    setShowSuggestions(false);
    setIsSearchFocused(false);
    setSelectedIndex(-1);
    setPreviewValue("");
  }, []);

  const executeSearch = useCallback(
    (searchQuery: string) => {
      addRecentSearch(searchQuery);
      setFilters({ ...filters, search: searchQuery });
      setInputValue(searchQuery);
      resetSearchUI();
    },
    [filters]
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const query = previewValue || inputValue;
      executeSearch(query);
    },
    [inputValue, previewValue]
  );

  const handleInputFocus = useCallback(() => {
    setIsSearchFocused(true);
    setShowSuggestions(true);
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      setPreviewValue("");
      setShowSuggestions(value.length > 0 || isSearchFocused);
      setSelectedIndex(-1);
    },
    [isSearchFocused]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const currentSuggestions =
        debouncedSearchQuery.trim().length > 0 ? suggest : recentSearches;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = Math.min(prev + 1, currentSuggestions.length - 1);
            if (newIndex >= 0) setPreviewValue(currentSuggestions[newIndex]);
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = Math.max(prev - 1, -1);
            if (newIndex === -1) setPreviewValue("");
            else setPreviewValue(currentSuggestions[newIndex]);
            return newIndex;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0)
            executeSearch(currentSuggestions[selectedIndex]);
          else executeSearch(inputValue);
          break;
        case "Escape":
          setShowSuggestions(false);
          setSelectedIndex(-1);
          setPreviewValue("");
          break;
      }
    },
    [debouncedSearchQuery, suggest, recentSearches, selectedIndex, inputValue]
  );

  return (
    <div
      className="hidden sm:flex flex-1 max-w-xl mx-8 relative"
      ref={desktopSearchRef}
    >
      <form onSubmit={handleSearchSubmit} className="w-full">
        <div className="relative">
          <div className="flex items-center border rounded-lg shadow-md bg-background">
            <Search className="ml-3 mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search products..."
              value={previewValue || inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              className="border-0 focus-visible:ring-0 bg-transparent"
            />
          </div>
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg h-60 shadow-lg z-50 overflow-y-auto">
              <ScrollArea className="h-full">
                <SearchSuggestions
                  debouncedSearchQuery={debouncedSearchQuery}
                  recentSearches={recentSearches}
                  selectedIndex={selectedIndex}
                  onSuggestionClick={executeSearch}
                  onMouseEnter={setPreviewValue}
                  onMouseLeave={() => setPreviewValue("")}
                />
              </ScrollArea>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
