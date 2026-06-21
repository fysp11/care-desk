import {
  createParamDecorator,
  type ExecutionContext,
} from '@nestjs/common';

import type { AuthenticatedRequest } from './types.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
