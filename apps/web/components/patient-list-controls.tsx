'use client';

import type { PatientListQuery } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface PatientListControlsProps {
  readonly isAdmin: boolean;
  readonly onCreate: () => void;
  readonly onQueryChange: (query: PatientListQuery) => void;
  readonly query: PatientListQuery;
}

export function PatientListControls({
  isAdmin,
  onCreate,
  onQueryChange,
  query,
}: PatientListControlsProps) {
  return (
    <Card>
      <CardContent className="p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <Field className="flex-1">
          <FieldLabel htmlFor="patient-search">Search patients</FieldLabel>
          <Input
            id="patient-search"
            onChange={(event) =>
              onQueryChange({
                ...query,
                page: 1,
                search: event.target.value,
              })
            }
            placeholder="Name, email, or phone"
            type="search"
            value={query.search}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="page-size">Rows</FieldLabel>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition hover:border-ring/60 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:w-28"
            id="page-size"
            onChange={(event) =>
              onQueryChange({
                ...query,
                limit: Number(event.target.value),
                page: 1,
              })
            }
            value={query.limit}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </Field>

        {isAdmin ? (
          <Button onClick={onCreate} type="button">
            New patient
          </Button>
        ) : null}
      </div>
      </CardContent>
    </Card>
  );
}
