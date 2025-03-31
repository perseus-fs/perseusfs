import { Column } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { memo } from 'react';
import { Button } from '../ui/button';

type TColumnHeaderProps = {
  label: string;
  column: Column<any>;
  sortable?: boolean;
};

const ColumnHeader = memo(
  ({ label, column, sortable = false }: TColumnHeaderProps) => {
    return (
      <div className="flex items-center">
        {label}
        {sortable && (
          <Button
            size="icon"
            variant="ghost"
            className="ml-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <ArrowUpDown />
          </Button>
        )}
      </div>
    );
  }
);

export { ColumnHeader };
