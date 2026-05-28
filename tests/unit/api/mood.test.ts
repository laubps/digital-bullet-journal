/**
 * @jest-environment node
 */

jest.mock('@/lib/auth/require-session', () => ({
  getSession: jest.fn(),
}));
jest.mock('@/lib/mood/entries', () => {
  const actual = jest.requireActual('@/lib/mood/entries');
  return {
    ...actual,
    createMoodWithOptionalJournal: jest.fn(),
  };
});
jest.mock('@/lib/mood/queries', () => ({
  getMoodSummary: jest.fn(),
}));

import { getSession } from '@/lib/auth/require-session';
import {
  createMoodWithOptionalJournal,
  UnknownMoodError,
  InvalidCategoryError,
  DuplicateMoodError,
} from '@/lib/mood/entries';
import { getMoodSummary } from '@/lib/mood/queries';
import { POST, GET } from '@/app/api/mood/route';

const mockGetSession = getSession as jest.Mock;
const mockCreate = createMoodWithOptionalJournal as jest.Mock;
const mockSummary = getMoodSummary as jest.Mock;

const today = new Date().toISOString().slice(0, 10);

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/mood', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  mockGetSession.mockReset();
  mockCreate.mockReset();
  mockSummary.mockReset();
});

describe('GET /api/mood', () => {
  function makeGet(date?: string): Request {
    const url = date
      ? `http://localhost/api/mood?date=${date}`
      : 'http://localhost/api/mood';
    return new Request(url);
  }

  it('returns 401 when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(makeGet(today));
    expect(res.status).toBe(401);
  });

  it('returns 400 when date is missing or malformed', async () => {
    mockGetSession.mockResolvedValue({ userId: 'u1', email: 'a@b.com' });
    expect((await GET(makeGet())).status).toBe(400);
    expect((await GET(makeGet('nope'))).status).toBe(400);
  });

  it('returns the summary for the user and date', async () => {
    mockGetSession.mockResolvedValue({ userId: 'u1', email: 'a@b.com' });
    mockSummary.mockResolvedValue({
      today: ['Happy', 'Sad'],
      last: { mood: 'Sad', entryDate: today, createdAt: '2026-05-27T10:00:00.000Z' },
    });
    const res = await GET(makeGet(today));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.today).toEqual(['Happy', 'Sad']);
    expect(body.last.mood).toBe('Sad');
    expect(mockSummary).toHaveBeenCalledWith('u1', today);
  });
});

describe('POST /api/mood', () => {
  it('returns 401 when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ mood: 'Happy', entryDate: today }));
    expect(res.status).toBe(401);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 400 on invalid JSON', async () => {
    mockGetSession.mockResolvedValue({ userId: 'u1', email: 'a@b.com' });
    const res = await POST(makeRequest('{not json'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when mood is unknown', async () => {
    mockGetSession.mockResolvedValue({ userId: 'u1', email: 'a@b.com' });
    const res = await POST(makeRequest({ mood: 'Hungry', entryDate: today }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.field).toBe('mood');
  });

  it('returns 400 when entryDate is malformed', async () => {
    mockGetSession.mockResolvedValue({ userId: 'u1', email: 'a@b.com' });
    const res = await POST(makeRequest({ mood: 'Happy', entryDate: 'nope' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.field).toBe('entryDate');
  });

  it('returns 201 with ids on success (no note → no journal)', async () => {
    mockGetSession.mockResolvedValue({ userId: 'u1', email: 'a@b.com' });
    mockCreate.mockResolvedValue({ moodEntryId: 'm-1', journalEntryId: null });

    const res = await POST(makeRequest({ mood: 'Calm', entryDate: today }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.moodEntryId).toBe('m-1');
    expect(body.journalEntryId).toBeNull();

    expect(mockCreate).toHaveBeenCalledWith({
      userId: 'u1',
      mood: 'Calm',
      entryDate: today,
      note: null,
      categoryId: null,
    });
  });

  it('forwards categoryId to the DB layer', async () => {
    mockGetSession.mockResolvedValue({ userId: 'u1', email: 'a@b.com' });
    mockCreate.mockResolvedValue({ moodEntryId: 'm-1', journalEntryId: null });

    const uuid = '11111111-2222-3333-4444-555555555555';
    const res = await POST(
      makeRequest({ mood: 'Happy', entryDate: today, categoryId: uuid }),
    );
    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: uuid }),
    );
  });

  it('returns 400 when category does not belong to user', async () => {
    mockGetSession.mockResolvedValue({ userId: 'u1', email: 'a@b.com' });
    mockCreate.mockRejectedValue(new InvalidCategoryError('11111111-2222-3333-4444-555555555555'));
    const res = await POST(
      makeRequest({
        mood: 'Happy',
        entryDate: today,
        categoryId: '11111111-2222-3333-4444-555555555555',
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.field).toBe('categoryId');
  });

  it('persists note as journal entry when provided', async () => {
    mockGetSession.mockResolvedValue({ userId: 'u1', email: 'a@b.com' });
    mockCreate.mockResolvedValue({ moodEntryId: 'm-1', journalEntryId: 'j-1' });

    const res = await POST(makeRequest({ mood: 'Sad', entryDate: today, note: 'rough day' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.journalEntryId).toBe('j-1');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ note: 'rough day', mood: 'Sad' }),
    );
  });

  it('returns 400 when DB reports UnknownMoodError', async () => {
    mockGetSession.mockResolvedValue({ userId: 'u1', email: 'a@b.com' });
    mockCreate.mockRejectedValue(new UnknownMoodError('Happy'));
    const res = await POST(makeRequest({ mood: 'Happy', entryDate: today }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.field).toBe('mood');
  });

  it('returns 409 when the mood is already saved for that day', async () => {
    mockGetSession.mockResolvedValue({ userId: 'u1', email: 'a@b.com' });
    mockCreate.mockRejectedValue(new DuplicateMoodError('Happy', today));
    const res = await POST(makeRequest({ mood: 'Happy', entryDate: today }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.field).toBe('mood');
  });

  it('returns 500 when DB throws unexpectedly', async () => {
    mockGetSession.mockResolvedValue({ userId: 'u1', email: 'a@b.com' });
    mockCreate.mockRejectedValue(new Error('DB down'));
    const res = await POST(makeRequest({ mood: 'Happy', entryDate: today }));
    expect(res.status).toBe(500);
  });
});
