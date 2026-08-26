import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export default function SortableHeader({ label, field, sortBy, order, onSort }) {
  const active = sortBy === field;
  return (
    <th
      onClick={() => onSort(field)}
      className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100"
    >
      <span className="flex items-center gap-1">
        {label}
        {active ? (
          order === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />
        )}
      </span>
    </th>
  );
}
