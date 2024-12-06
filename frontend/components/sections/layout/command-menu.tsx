"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Circle, File, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { docsConfig, DUMMY_HERO_TABLE_DATA } from "@/lib/constants";
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

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const { paid } = useEnvironmentStore((store) => store);

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
                {DUMMY_HERO_TABLE_DATA.map((navItem, id) => (
                  <CommandItem
                    key={id}
                    value={navItem.ticker}
                    onSelect={() => {
                      runCommand(() => router.push("/token/" + navItem.ticker));
                    }}
                    className="data-[selected='true']:bg-secondary cursor-pointer"
                  >
                    <img
                      src={navItem.image}
                      alt={navItem.ticker}
                      className="w-6 h-6 mr-1 rounded-full"
                    />
                    <span>{navItem.ticker}</span>
                    <span className="text-accent">/ SOL</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {docsConfig.sidebarNav.map((group) => (
                <CommandGroup key={group.title} heading={group.title}>
                  {group.items.map((navItem: any) => (
                    <CommandItem
                      key={navItem.href}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() => router.push(navItem.href as string));
                      }}
                    >
                      <div className="mr-2 flex h-4 w-4 items-center justify-center">
                        <Circle className="h-3 w-3" />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
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
