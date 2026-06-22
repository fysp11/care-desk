'use client';

import type {
  Patient,
  PatientSortBy,
  PatientSortDir,
} from '../lib/types';

interface PatientTableProps {
  readonly isAdmin: boolean;
  readonly isLoading: boolean;
  readonly onDelete: (patient: Patient) => void;
  readonly onDetails: (patient: Patient) => void;
  readonly onEdit: (patient: Patient) => void;
  readonly onSort: (field: PatientSortBy) => void;
  readonly patients: readonly Patient[];
  readonly sortBy: PatientSortBy;
  readonly sortDir: PatientSortDir;
}

const sortableColumns: readonly {
  readonly field: PatientSortBy;
  readonly label: string;
}[] = [
  { field: 'lastName', label: 'Last name' },
  { field: 'firstName', label: 'First name' },
  { field: 'dob', label: 'DOB' },
  { field: 'email', label: 'Email' },
];

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00.000Z`));

export function PatientTable({
  isAdmin,
  isLoading,
  onDelete,
  onDetails,
  onEdit,
  onSort,
  patients,
  sortBy,
  sortDir,
}: PatientTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[760px] w-full border-collapse text-left text-sm">
        <caption className="sr-only">Patients</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-600">
          <tr>
            {sortableColumns.map((column) => {
              const isSorted = sortBy === column.field;
              const indicator = isSorted
                ? sortDir === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'not sorted';
              const ariaSort = isSorted
                ? sortDir === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none';

              return (
                <th
                  aria-sort={ariaSort}
                  className="px-4 py-3 font-semibold"
                  key={column.field}
                  scope="col"
                >
                  <button
                    aria-label={`Sort by ${column.label}, currently ${indicator}`}
                    className="inline-flex items-center gap-1 rounded-sm text-left transition hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    onClick={() => onSort(column.field)}
                    type="button"
                  >
                    {column.label}
                    <span aria-hidden="true" className="text-slate-400">
                      {isSorted ? (sortDir === 'asc' ? 'A-Z' : 'Z-A') : ''}
                    </span>
                  </button>
                </th>
              );
            })}
            <th className="px-4 py-3 font-semibold" scope="col">
              Phone
            </th>
            <th className="px-4 py-3 text-right font-semibold" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? <LoadingRows /> : null}
          {!isLoading && patients.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-slate-600" colSpan={6}>
                No patients match the current view.
              </td>
            </tr>
          ) : null}
          {!isLoading
            ? patients.map((patient) => (
                <tr className="transition hover:bg-slate-50" key={patient.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">
                    {patient.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{patient.firstName}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(patient.dob)}</td>
                  <td className="px-4 py-3 text-slate-700">{patient.email}</td>
                  <td className="px-4 py-3 text-slate-700">{patient.phoneNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        onClick={() => onDetails(patient)}
                        type="button"
                      >
                        Details
                      </button>
                      {isAdmin ? (
                        <>
                          <button
                            className="rounded-md border border-sky-300 px-3 py-1.5 text-xs font-medium text-sky-800 transition hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                            onClick={() => onEdit(patient)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-800 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            onClick={() => onDelete(patient)}
                            type="button"
                          >
                            Delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {[0, 1, 2, 3].map((row) => (
        <tr key={row}>
          {[0, 1, 2, 3, 4, 5].map((cell) => (
            <td className="px-4 py-4" key={cell}>
              <div className="h-4 animate-pulse rounded bg-slate-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
