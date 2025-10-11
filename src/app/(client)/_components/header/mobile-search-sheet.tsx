import { useState, useRef, useCallback, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useProductFilters } from "@/app/(client)/hooks/products/use-product-fillters";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchSuggestions } from "./search-suggestions";
import { Button } from "@/components/ui/button";
import { useGetSuggest } from "../../hooks/products/use-get-suggest";

interface MobileSearchSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSearchSheet({ isOpen, onOpenChange }: MobileSearchSheetProps) {
  const { filters, setFilters } = useProductFilters();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(filters.search || "");
  const [previewValue, setPreviewValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(inputValue, 300);

  const { suggest } = useGetSuggest({ search: debouncedSearchQuery });

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    setInputValue(filters.search || "");
  }, [filters.search]);

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
      onOpenChange(false);
    },
    [filters, setFilters, addRecentSearch, resetSearchUI, onOpenChange]
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const query = previewValue || inputValue;
      executeSearch(query);
    },
    [inputValue, previewValue, executeSearch]
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
      const currentSuggestions = debouncedSearchQuery.trim().length > 0 ? suggest : recentSearches;
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
          if (selectedIndex >= 0) executeSearch(currentSuggestions[selectedIndex]);
          else executeSearch(inputValue);
          break;
        case "Escape":
          setShowSuggestions(false);
          setSelectedIndex(-1);
          setPreviewValue("");
          break;
      }
    },
    [debouncedSearchQuery, suggest, recentSearches, selectedIndex, inputValue, executeSearch]
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="h-auto border-0" showX={false}>
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Search</SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <div ref={mobileSearchRef}>
          <form onSubmit={handleSearchSubmit} className="space-y-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={previewValue || inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                className="pl-10 h-12 text-base border-0 focus-visible:ring-1"
                autoFocus
              />
            </div>
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                <SearchSuggestions
                  debouncedSearchQuery={debouncedSearchQuery}
                  recentSearches={recentSearches}
                  selectedIndex={selectedIndex}
                  onSuggestionClick={executeSearch}
                  onMouseEnter={setPreviewValue}
                  onMouseLeave={() => setPreviewValue("")}
                />
              </div>
            )}
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}