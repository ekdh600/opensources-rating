"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { MarketPageIntro, MarketPanel } from "@/components/market/MarketUi";
import { api } from "@/lib/api";
import { loginTradingSession } from "@/lib/trading-session";
import { cn } from "@/lib/utils";

type AuthMode =
  | "login"
  | "register"
  | "verify-email"
  | "find-id"
  | "reset-password-request"
  | "reset-password-confirm";

export function FigmaMarketAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit() {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (mode === "login") {
        await loginTradingSession({ username, password });
        router.push("/market/account");
        router.refresh();
        return;
      }

      if (mode === "register") {
        const result = await api.auth.register({
          username,
          email,
          display_name: displayName,
          password,
        });
        setSuccess(result.message);
        setMode("verify-email");
        return;
      }

      if (mode === "verify-email") {
        const result = token
          ? await api.auth.confirmEmailVerification({ token })
          : await api.auth.requestEmailVerification({ email });
        setSuccess(result.message);
        if (token) setMode("login");
        return;
      }

      if (mode === "find-id") {
        const result = await api.auth.recoverId({ email });
        setSuccess(result.message);
        return;
      }

      if (mode === "reset-password-request") {
        const result = await api.auth.requestPasswordReset({
          email,
          username: username || undefined,
        });
        setSuccess(result.message);
        setMode("reset-password-confirm");
        return;
      }

      if (mode === "reset-password-confirm") {
        const result = await api.auth.confirmPasswordReset({
          token,
          new_password: newPassword,
        });
        setSuccess(result.message);
        setMode("login");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "인증 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const primaryDisabled =
    loading ||
    (mode === "login" && (!username || !password)) ||
    (mode === "register" && (!username || !email || !displayName || !password)) ||
    (mode === "verify-email" && !email && !token) ||
    (mode === "find-id" && !email) ||
    (mode === "reset-password-request" && !email) ||
    (mode === "reset-password-confirm" && (!token || !newPassword));

  return (
    <div className="space-y-6">
      <MarketPageIntro
        eyebrow="Auth"
        title="로그인 / 계정 복구"
        description="개인 포인트 기반 트레이딩 게임을 이용하려면 이메일 인증이 완료된 계정이 필요합니다."
        stats={[
          { label: "로그인", value: "인증 완료 계정", note: "이메일 인증을 마친 계정만 트레이딩을 이용할 수 있습니다." },
          { label: "이메일 검증", value: "토큰 기반", note: "회원가입 후 이메일 토큰으로 계정을 활성화합니다." },
          { label: "아이디 찾기", value: "이메일 발송", note: "등록한 이메일로 아이디 안내 메일을 보냅니다." },
          { label: "비밀번호 복구", value: "재설정 토큰", note: "이전 비밀번호는 다시 사용할 수 없습니다." },
        ]}
      />

      <MarketPanel className="mx-auto max-w-[680px] p-5">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {[
            ["login", "로그인"],
            ["register", "회원가입"],
            ["verify-email", "이메일 인증"],
            ["find-id", "아이디 찾기"],
            ["reset-password-request", "비밀번호 찾기"],
            ["reset-password-confirm", "비밀번호 변경"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value as AuthMode);
                setError(null);
                setSuccess(null);
              }}
              className={cn(
                "h-11 rounded-[4px] border px-3 text-[13px] font-semibold transition",
                mode === value ? "border-[#3366ff] bg-[rgba(51,102,255,0.12)] text-[#d1d4dc]" : "border-[#2b2f36] bg-[#161b24] text-[#848e9c]",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4">
          {(mode === "login" || mode === "register" || mode === "reset-password-request") ? (
            <label className="block">
              <span className="text-[12px] text-[#848e9c]">아이디</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
              />
            </label>
          ) : null}

          {(mode === "register" || mode === "verify-email" || mode === "find-id" || mode === "reset-password-request") ? (
            <label className="block">
              <span className="text-[12px] text-[#848e9c]">이메일</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
              />
            </label>
          ) : null}

          {mode === "register" ? (
            <label className="block">
              <span className="text-[12px] text-[#848e9c]">표시 이름</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
              />
            </label>
          ) : null}

          {(mode === "login" || mode === "register") ? (
            <label className="block">
              <span className="text-[12px] text-[#848e9c]">비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
              />
            </label>
          ) : null}

          {(mode === "verify-email" || mode === "reset-password-confirm") ? (
            <label className="block">
              <span className="text-[12px] text-[#848e9c]">토큰</span>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
              />
            </label>
          ) : null}

          {mode === "reset-password-confirm" ? (
            <label className="block">
              <span className="text-[12px] text-[#848e9c]">새 비밀번호</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
              />
            </label>
          ) : null}
        </div>

        {success ? (
          <div className="mt-4 rounded-[6px] border border-[rgba(20,184,166,0.28)] bg-[rgba(20,184,166,0.12)] px-4 py-3 text-[13px] text-[#d7fffa]">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-[6px] border border-[rgba(214,88,58,0.28)] bg-[rgba(214,88,58,0.1)] px-4 py-3 text-[13px] text-[#ffd7cf]">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void submit()}
          disabled={primaryDisabled}
          className={cn(
            "mt-5 h-11 w-full rounded-[4px] bg-[#3366ff] text-[15px] font-semibold text-white transition hover:bg-[#4b7cff]",
            primaryDisabled && "cursor-not-allowed opacity-60",
          )}
        >
          {loading
            ? "처리 중..."
            : mode === "login"
              ? "로그인"
              : mode === "register"
                ? "회원가입"
                : mode === "verify-email"
                  ? token
                    ? "이메일 인증 완료"
                    : "인증 메일 재발송"
                  : mode === "find-id"
                    ? "아이디 찾기"
                    : mode === "reset-password-request"
                      ? "재설정 토큰 받기"
                      : "새 비밀번호 저장"}
        </button>
      </MarketPanel>
    </div>
  );
}
