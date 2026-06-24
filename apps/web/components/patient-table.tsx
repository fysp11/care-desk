'use client';

import type {
  Patient,
  PatientSortBy,
  PatientSortDir,
} from '../lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  { field: 'firstName', label: 'First name' },
  { field: 'lastName', label: 'Last name' },
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
    <Card className="overflow-hidden">
      <Table className="min-w-[760px]">
        <TableCaption className="sr-only">Patients</TableCaption>
        <TableHeader className="bg-muted/60">
          <TableRow>
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
                <TableHead
                  aria-sort={ariaSort}
                  key={column.field}
                  scope="col"
                >
                  <Button
                    aria-label={`Sort by ${column.label}, currently ${indicator}`}
                    className="h-auto justify-start gap-1 p-0 text-xs uppercase text-muted-foreground hover:text-primary"
                    onClick={() => onSort(column.field)}
                    type="button"
                    variant="ghost"
                  >
                    {column.label}
                    <span aria-hidden="true" className="text-muted-foreground">
                      {isSorted ? (sortDir === 'asc' ? 'A-Z' : 'Z-A') : ''}
                    </span>
                  </Button>
                </TableHead>
              );
            })}
            <TableHead scope="col">
              Phone
            </TableHead>
            <TableHead className="text-right" scope="col">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? <LoadingRows /> : null}
          {!isLoading && patients.length === 0 ? (
            <TableRow>
              <TableCell className="py-8 text-center text-muted-foreground" colSpan={6}>
                No patients match the current view.
              </TableCell>
            </TableRow>
          ) : null}
          {!isLoading
            ? patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium text-foreground">
                    {patient.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {patient.firstName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(patient.dob)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {patient.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {patient.phoneNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        onClick={() => onDetails(patient)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        Details
                      </Button>
                      {isAdmin ? (
                        <>
                          <Button
                            onClick={() => onEdit(patient)}
                            size="sm"
                            type="button"
                            variant="secondary"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => onDelete(patient)}
                            size="sm"
                            type="button"
                            variant="destructive"
                          >
                            Delete
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </Card>
  );
}

function LoadingRows() {
  return (
    <>
      {[0, 1, 2, 3].map((row) => (
        <TableRow key={row}>
          {[0, 1, 2, 3, 4, 5].map((cell) => (
            <TableCell className="py-4" key={cell}>
              <Skeleton className="h-4" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
