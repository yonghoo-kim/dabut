"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { clearSessionBackup, saveSessionBackup } from "@/lib/auth/session-backup";

/** 로그인된 화면에서 최신 refresh token 을 이 기기에 백업해 둔다 (lib/auth/session-backup.ts 참고). */
export function SessionBackup() {
  useEffect(() => {
    const supabase = createClient();
    const sync = () => {
      supabase.auth.getSession().then(({ data }) => saveSessionBackup(data.session?.refresh_token));
    };
    sync();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") clearSessionBackup();
      else saveSessionBackup(session?.refresh_token);
    });
    // 서버(미들웨어)가 토큰을 갱신했을 수 있으니 앱으로 돌아올 때마다 다시 백업.
    const onVisible = () => document.visibilityState === "visible" && sync();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return null;
}
