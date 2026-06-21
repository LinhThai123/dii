export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}
}

export class CoupleLinkedEvent {
  constructor(
    public readonly coupleId: string,
    public readonly userIds: string[],
  ) {}
}

export class DateCreatedEvent {
  constructor(
    public readonly datePlanId: string,
    public readonly coupleId: string,
  ) {}
}

export class MemoryAddedEvent {
  constructor(
    public readonly memoryId: string,
    public readonly coupleId: string,
  ) {}
}

export const Events = {
  USER_CREATED: 'user.created',
  COUPLE_LINKED: 'couple.linked',
  DATE_CREATED: 'date.created',
  MEMORY_ADDED: 'memory.added',
} as const;
