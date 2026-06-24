'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PatientPaginationProps {
  readonly isLoading: boolean;
  readonly onPageChange: (page: number) => void;
  readonly page: number;
  readonly totalPages: number;
  readonly totalPatients: number;
}

export function PatientPagination({
  isLoading,
  onPageChange,
  page,
  totalPages,
  totalPatients,
}: PatientPaginationProps) {
  return (
    <Card className="flex flex-col gap-3 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div>
        Page <span className="font-semibold">{page}</span> of{' '}
        <span className="font-semibold">{totalPages}</span>
        <span className="ml-2">{totalPatients} total</span>
      </div>
      <div className="flex gap-2">
        <Button
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          type="button"
          variant="outline"
        >
          Previous
        </Button>
        <Button
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          type="button"
          variant="outline"
        >
          Next
        </Button>
      </div>
    </Card>
  );
}
