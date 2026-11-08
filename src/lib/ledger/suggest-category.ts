export type MemoHistoryItem = { memo: string | null; categoryId: string; type: string };

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

/**
 * 메모를 타이핑하는 동안 과거 기록에서 비슷한 메모를 찾아 카테고리를 추천한다.
 * 점수: 완전 일치 3 > 부분 포함(양방향, 2글자 이상) 2. 같은 점수 안에서는 가장 많이 쓴 카테고리,
 * 동률이면 더 최근 기록(history 는 최신순)을 따른다.
 */
export function suggestCategory(
  memo: string,
  history: readonly MemoHistoryItem[],
  type: string
): string | null {
  const typed = normalize(memo.trim());
  if (typed.length < 2) return null;

  const scores = new Map<string, { score: number; count: number; firstIndex: number }>();
  let best = 0;
  history.forEach((item, index) => {
    if (item.type !== type || !item.memo) return;
    const past = normalize(item.memo);
    if (past.length < 2) return;
    let score = 0;
    if (past === typed) score = 3;
    else if (past.includes(typed) || typed.includes(past)) score = 2;
    if (score === 0) return;
    best = Math.max(best, score);
    const key = `${score}:${item.categoryId}`;
    const entry = scores.get(key);
    if (entry) entry.count += 1;
    else scores.set(key, { score, count: 1, firstIndex: index });
  });
  if (best === 0) return null;

  let winner: { categoryId: string; count: number; firstIndex: number } | null = null;
  for (const [key, entry] of scores) {
    if (entry.score !== best) continue;
    const categoryId = key.slice(key.indexOf(":") + 1);
    if (!winner || entry.count > winner.count || (entry.count === winner.count && entry.firstIndex < winner.firstIndex)) {
      winner = { categoryId, count: entry.count, firstIndex: entry.firstIndex };
    }
  }
  return winner?.categoryId ?? null;
}

export type MemoSuggestion = { memo: string; categoryId: string; count: number };

/**
 * 메모 자동완성 후보: 지금까지 입력한 메모 중 타이핑한 글자를 포함하는 것 (같은 유형만).
 * 앞부분이 일치하는 것 먼저, 그다음 많이 쓴 순, 최근 순. 이미 똑같이 입력한 메모는 제외.
 */
export function suggestMemos(
  typed: string,
  history: readonly MemoHistoryItem[],
  type: string,
  limit = 6
): MemoSuggestion[] {
  const query = normalize(typed.trim());
  if (!query) return [];
  const byMemo = new Map<string, MemoSuggestion & { firstIndex: number; prefix: boolean }>();
  history.forEach((item, index) => {
    if (item.type !== type || !item.memo) return;
    const memo = item.memo.trim();
    const norm = normalize(memo);
    if (!norm.includes(query) || norm === query) return;
    const existing = byMemo.get(norm);
    if (existing) existing.count += 1;
    else byMemo.set(norm, { memo, categoryId: item.categoryId, count: 1, firstIndex: index, prefix: norm.startsWith(query) });
  });
  return [...byMemo.values()]
    .sort((a, b) => Number(b.prefix) - Number(a.prefix) || b.count - a.count || a.firstIndex - b.firstIndex)
    .slice(0, limit)
    .map(({ memo, categoryId, count }) => ({ memo, categoryId, count }));
}
