"use client";

import {
    Button,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    cn,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@repo/ui";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

interface ComboboxOption {
    value: string;
    label: string;
    description?: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
    disabled?: boolean;
}

export function Combobox({
    options,
    value,
    onValueChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    className,
    disabled = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);

    const selectedOption = options.find((option) => option.value === value);

    return (
        <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
                <Button
                    aria-expanded={open}
                    className={cn("justify-between", className)}
                    disabled={disabled}
                    role="combobox"
                    variant="outline"
                >
                    <span className="truncate">{selectedOption?.label || placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-full p-0" side="bottom">
                <Command>
                    <CommandInput className="h-9" placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        onValueChange(option.value);
                                        setOpen(false);
                                    }}
                                    value={option.value}
                                >
                                    <div className="flex flex-1 flex-col">
                                        <span className="font-medium">{option.label}</span>
                                        {option.description && (
                                            <span className="text-muted-foreground text-xs">
                                                {option.description}
                                            </span>
                                        )}
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0",
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
