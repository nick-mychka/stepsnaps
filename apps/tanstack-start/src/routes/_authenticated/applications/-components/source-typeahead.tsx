import { useState } from "react";

import { Button } from "@stepsnaps/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@stepsnaps/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@stepsnaps/ui/popover";

import { useSourceSearch } from "../-hooks/use-source-search";

interface SourceTypeaheadProps {
  value: string;
  onChange: (value: string) => void;
}

export function SourceTypeahead(props: SourceTypeaheadProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: sources } = useSourceSearch(search, { enabled: open });

  const hasExactMatch = sources?.some(
    (s) => s.name.toLowerCase() === search.trim().toLowerCase(),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          type="button"
        >
          {props.value || "Select source..."}
          <span className="text-muted-foreground ml-2 text-xs">
            {open ? "▲" : "▼"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search sources..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {search.trim() ? "No sources found." : "Type to search..."}
            </CommandEmpty>
            <CommandGroup>
              {sources?.map((source) => (
                <CommandItem
                  key={source.id}
                  value={source.name}
                  onSelect={() => {
                    props.onChange(source.name);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {source.name}
                </CommandItem>
              ))}
              {search.trim() && !hasExactMatch && (
                <CommandItem
                  value={`create-${search}`}
                  onSelect={() => {
                    props.onChange(search.trim());
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  Create "{search.trim()}"
                </CommandItem>
              )}
              {props.value && (
                <CommandItem
                  value="__clear__"
                  onSelect={() => {
                    props.onChange("");
                    setOpen(false);
                    setSearch("");
                  }}
                  className="text-muted-foreground"
                >
                  Clear selection
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
