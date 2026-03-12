import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useMediaQuery } from '@/lib/useMediaQuery';

export default function MobileDrawerSelect({
  value,
  onValueChange,
  placeholder,
  items,
  label,
  className,
}) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`w-full px-3 py-2 rounded-md border border-input bg-background text-sm font-medium text-left hover:bg-accent ${className}`}
      >
        {value
          ? items.find((i) => i.value === value)?.label
          : placeholder}
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{label || 'Select an option'}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-2">
            {items.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onValueChange(item.value);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
              >
                <span className="font-medium">{item.label}</span>
                {value === item.value && (
                  <Check className="w-5 h-5 text-violet-600" />
                )}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}