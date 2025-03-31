import { DEFAULT_PAGE_SIZE } from '@/statics';
import { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';

const POSSIBLE_PER_PAGE = [10, 25, 50, 100];

type TPerPageProps = {
  perPage: number;
  setPerPage: (perPage: number) => void;
};

const PerPage = memo(({ perPage, setPerPage }: TPerPageProps) => {
  return (
    <div className="flex items-center gap-2">
      <div>
        <Select
          defaultValue={DEFAULT_PAGE_SIZE.toString()}
          value={perPage.toString()}
          onValueChange={(value) => setPerPage(+value)}
        >
          <SelectTrigger className="w-20">
            <SelectValue placeholder="Select permission" />
          </SelectTrigger>
          <SelectContent>
            {POSSIBLE_PER_PAGE.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className='text-sm'>per page</span>
    </div>
  );
});

export { PerPage };
