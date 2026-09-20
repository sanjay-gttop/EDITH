export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized: Invalid or missing credentials') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden: Insufficient permissions for this action') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('RESOURCE_NOT_FOUND', `${resource} with id '${id}' was not found`, 404, { resource, id });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('STATE_CONFLICT', message, 409, details);
    this.name = 'ConflictError';
  }
}

export class StaleVersionError extends AppError {
  constructor(resourceId: string, currentVersion: number, submittedVersion: number) {
    super(
      'STALE_VERSION_REJECTED',
      `Resource ${resourceId} observed version (${submittedVersion}) is stale compared to authoritative version (${currentVersion})`,
      409,
      { resource_id: resourceId, current_version: currentVersion, submitted_version: submittedVersion },
    );
    this.name = 'StaleVersionError';
  }
}
