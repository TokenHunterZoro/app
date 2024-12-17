"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import { type DialogProps } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useEnvironmentStore } from "@/components/context";
import UnlockNow from "@/components/unlock-now";
import searchTokens from "@/lib/supabase/searchTokens";
import { SearchTokenResponse } from "@/lib/types";

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const { paid } = useEnvironmentStore((store) => store);
  const [searchResults, setSearchResults] = useState<SearchTokenResponse[]>([]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        // Perform database query
        const results = await searchTokens(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed", error);
      }
    }, 300), // 300ms delay
    []
  );

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    debouncedSearch(searchTerm);
  };

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "sen relative h-10 flex w-full bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-80"
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex w-full text-start ">
          Search memecoins...
        </span>
        <span className="inline-flex lg:hidden ">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.4rem] top-[0.4rem] hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-md font-medium opacity-100 sm:flex">
          <span className="text-sm">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        {paid ? (
          <>
            <CommandInput placeholder="Type a ticker or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Memecoins">
                {searchResults.map((navItem, id) => (
                  <CommandItem
                    key={id}
                    value={navItem.symbol}
                    onSelect={() => {
                      runCommand(() => router.push("/token/" + navItem.id));
                    }}
                    className="data-[selected='true']:bg-secondary cursor-pointer"
                  >
                    <img
                      src={navItem.image}
                      alt={navItem.symbol}
                      className="w-6 h-6 mr-1 rounded-full"
                    />
                    <span>{navItem.symbol}</span>
                    <span className="text-accent">/ SOL</span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />
            </CommandList>
          </>
        ) : (
          <div className="h-[300px] flex flex-col justify-center">
            <UnlockNow text="Search and analyze all memecoins" />
          </div>
        )}
      </CommandDialog>
    </>
  );
}
