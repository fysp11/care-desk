import { SetMetadata } from '@nestjs/common';

import type { UserRole } from './types.js';

export const ROLES_KEY = 'care-desk:roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
