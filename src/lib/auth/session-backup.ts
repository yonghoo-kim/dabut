import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 로그인 유지 보강: 쿠키가 지워지거나 만료돼도(예: iOS Safari 의 쿠키 정리) 이 기기의 localStorage 에
 * 남겨 둔 refresh token 으로 세션을 되살린다. 로그아웃하면 지운다.
 * 주의: 브라우저의 "사이트 데이터 전체 삭제"처럼 localStorage 까지 지우면 복구할 방법이 없다.
 */
const KEY = "dabut:session-backup";

export function saveSessionBackup(refreshToken: string | null | undefined) {
  try {
    if (refreshToken) localStorage.setItem(KEY, refreshToken);
  } catch {
    // storage unavailable
  }
}

export function clearSessionBackup() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** 백업 토큰으로 세션 복구를 시도한다. 성공하면 true (쿠키도 다시 써진다). */
export async function restoreSessionFromBackup(supabase: SupabaseClient): Promise<boolean> {
  let token: string | null = null;
  try {
    token = localStorage.getItem(KEY);
  } catch {
    return false;
  }
  if (!token) return false;
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: token });
  if (error || !data.session) {
    clearSessionBackup();
    return false;
  }
  saveSessionBackup(data.session.refresh_token);
  return true;
}
