'use client';

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
    <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        Page <span className="font-semibold">{page}</span> of{' '}
        <span className="font-semibold">{totalPages}</span>
        <span className="ml-2 text-slate-500">{totalPatients} total</span>
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          type="button"
        >
          Previous
        </button>
        <button
          className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
