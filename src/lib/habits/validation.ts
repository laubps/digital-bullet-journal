export const MIN_TARGET_DAYS = 22;
export const MAX_TARGET_DAYS = 365;
export const MAX_NAME_LENGTH = 255;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export type HabitFieldError = {
  field: 'name' | 'targetDays' | 'categoryId' | 'isActive' | 'checkDate' | 'done' | 'general';
  message: string;
};

// ----- create -----

export type CreateHabitFields = {
  name: string;
  targetDays: number;
  categoryId: string | null;
};

export type CreateValidation =
  | { ok: true; fields: CreateHabitFields }
  | { ok: false; error: HabitFieldError };

export function validateCreateHabit(data: unknown): CreateValidation {
  if (typeof data !== 'object' || data === null) {
    return { ok: false, error: { field: 'general', message: 'invalid request body' } };
  }
  const { name, targetDays, categoryId } = data as Record<string, unknown>;

  if (typeof name !== 'string' || name.trim() === '') {
    return { ok: false, error: { field: 'name', message: 'please name this habit' } };
  }
  const trimmedName = name.trim();
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return { ok: false, error: { field: 'name', message: `name must be ${MAX_NAME_LENGTH} characters or fewer` } };
  }

  const days = typeof targetDays === 'number' ? targetDays : Number(targetDays);
  if (!Number.isInteger(days) || days < MIN_TARGET_DAYS || days > MAX_TARGET_DAYS) {
    return {
      ok: false,
      error: {
        field: 'targetDays',
        message: `duration must be an integer between ${MIN_TARGET_DAYS} and ${MAX_TARGET_DAYS}`,
      },
    };
  }

  let finalCategoryId: string | null = null;
  if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
    if (typeof categoryId !== 'string' || !UUID_REGEX.test(categoryId)) {
      return { ok: false, error: { field: 'categoryId', message: 'invalid category' } };
    }
    finalCategoryId = categoryId;
  }

  return { ok: true, fields: { name: trimmedName, targetDays: days, categoryId: finalCategoryId } };
}

// ----- update -----

export type UpdateHabitFields = {
  targetDays?: number;
  categoryId?: string | null;
  isActive?: boolean;
};

export type UpdateValidation =
  | { ok: true; fields: UpdateHabitFields }
  | { ok: false; error: HabitFieldError };

export function validateUpdateHabit(data: unknown): UpdateValidation {
  if (typeof data !== 'object' || data === null) {
    return { ok: false, error: { field: 'general', message: 'invalid request body' } };
  }
  const { targetDays, categoryId, isActive } = data as Record<string, unknown>;
  const fields: UpdateHabitFields = {};

  if (targetDays !== undefined) {
    const days = typeof targetDays === 'number' ? targetDays : Number(targetDays);
    if (!Number.isInteger(days) || days < MIN_TARGET_DAYS || days > MAX_TARGET_DAYS) {
      return {
        ok: false,
        error: {
          field: 'targetDays',
          message: `duration must be an integer between ${MIN_TARGET_DAYS} and ${MAX_TARGET_DAYS}`,
        },
      };
    }
    fields.targetDays = days;
  }

  if (categoryId !== undefined) {
    if (categoryId === null || categoryId === '') {
      fields.categoryId = null;
    } else if (typeof categoryId !== 'string' || !UUID_REGEX.test(categoryId)) {
      return { ok: false, error: { field: 'categoryId', message: 'invalid category' } };
    } else {
      fields.categoryId = categoryId;
    }
  }

  if (isActive !== undefined) {
    if (typeof isActive !== 'boolean') {
      return { ok: false, error: { field: 'isActive', message: 'isActive must be boolean' } };
    }
    fields.isActive = isActive;
  }

  if (Object.keys(fields).length === 0) {
    return { ok: false, error: { field: 'general', message: 'nothing to update' } };
  }

  return { ok: true, fields };
}

// ----- check-ins -----

export type CheckinFields = {
  checkDate: string;
  done: boolean;
};

export type CheckinValidation =
  | { ok: true; fields: CheckinFields }
  | { ok: false; error: HabitFieldError };

export function validateCheckinInput(data: unknown): CheckinValidation {
  if (typeof data !== 'object' || data === null) {
    return { ok: false, error: { field: 'general', message: 'invalid request body' } };
  }
  const { checkDate, done } = data as Record<string, unknown>;

  if (typeof checkDate !== 'string' || !DATE_REGEX.test(checkDate)) {
    return { ok: false, error: { field: 'checkDate', message: 'date must be YYYY-MM-DD' } };
  }
  const parsed = new Date(`${checkDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== checkDate) {
    return { ok: false, error: { field: 'checkDate', message: 'invalid date' } };
  }
  const todayIso = new Date().toISOString().slice(0, 10);
  if (checkDate > todayIso) {
    return { ok: false, error: { field: 'checkDate', message: 'cannot check off a future day' } };
  }

  if (typeof done !== 'boolean') {
    return { ok: false, error: { field: 'done', message: 'done must be boolean' } };
  }

  return { ok: true, fields: { checkDate, done } };
}
