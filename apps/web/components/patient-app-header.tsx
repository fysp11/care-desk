'use client';

import type { StoredSession } from '../lib/session';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PatientAppHeaderProps {
  readonly onLogout: () => void;
  readonly session: StoredSession;
}

export function PatientAppHeader({
  onLogout,
  session,
}: PatientAppHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-primary">Care Desk</p>
        <h1 className="text-2xl font-semibold text-foreground">
          Patients management
        </h1>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Card className="px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {session.user.email}
          </span>
          <Badge className="ml-2" variant="secondary">
            {session.user.role}
          </Badge>
        </Card>
        <Button onClick={onLogout} type="button" variant="outline">
          Logout
        </Button>
      </div>
    </header>
  );
}
