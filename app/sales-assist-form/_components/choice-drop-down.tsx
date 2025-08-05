"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as React from "react";

type Option = {
  label: string;
  value: string;
};

const OPTIONS: Option[] = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
  { label: "Option C", value: "c" },
  { label: "Option D", value: "d" },
  { label: "Option E", value: "e" },
];

export function ChoiceDropDown() {
  const [selected, setSelected] = React.useState<string[]>([]);

  const toggleValue = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {selected.length > 0
            ? `${selected.length} selected`
            : "Select options"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <ScrollArea className="max-h-48">
          <div className="space-y-2">
            {OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={selected.includes(option.value)}
                  onCheckedChange={() => toggleValue(option.value)}
                />
                <label htmlFor={option.value} className="text-sm">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
