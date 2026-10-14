"use client";

import { FormEvent, ReactNode, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { API_BASE_URL as apiUrl } from "@/lib/api";

type Mode = "signin" | "signup";

type ApiResult = {
  user: { id: string; email: string; name: string; loyaltyPoints: number; role: "CUSTOMER" | "BARISTA" };
  accessToken: string;
};

type IconName =
  | "coffee"
  | "user"
  | "mail"
  | "lock"
  | "eye"
  | "eyeOff"
  | "refresh";

function Icon({
  name,
  className = "icon",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    coffee: (
      <>
        <path d="M5 8h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z" />
        <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 4v2M12 3v3M16 4v2M3 21h16" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-3.1 3.6M6.2 6.8C3.5 8.6 2 12 2 12s3.5 6 10 6a10 10 0 0 0 3-.4" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8 8 0 1 0 1 4" />
        <path d="M20 5v6h-6" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function getErrorMessage(value: unknown) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object" && "message" in value)
    return String(value.message);
  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export function AuthPage({ reason }: { reason?: string }) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(reason === "login" ? "Vui lòng đăng nhập để tiếp tục" : "");
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);


  const strength = useMemo(() => {
    if (!password) {
      return {
        level: "weak",
        label: "Nhập mật khẩu",
        color: "#EF4444",
      };
    }
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (hasLength && hasUpper && hasNumber && hasSpecial) {
      return { level: "strong", label: "Mật khẩu mạnh", color: "#10B981" };
    }
    if (hasLength && (hasUpper || hasNumber)) {
      return { level: "medium", label: "Mật khẩu trung bình", color: "#F59E0B" };
    }
    return {
      level: "weak",
      label: "Mật khẩu yếu (ít nhất 8 ký tự)",
      color: "#EF4444",
    };
  }, [password]);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setEmailError("");
    setSuccess("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setEmailError("");
    setSuccess("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    // 1. Client-side field validations
    if (mode === "signup" && !trimmedName) {
      setError("Vui lòng nhập họ tên.");
      return;
    }
    if (!trimmedEmail) {
      setEmailError("Vui lòng nhập email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Email không hợp lệ.");
      return;
    }
    if (!trimmedPassword) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (mode === "signup" && !terms) {
      setError(
        "Vui lòng đồng ý với điều khoản sử dụng và chính sách bảo mật.",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/auth/${mode === "signin" ? "login" : "register"}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "signin"
              ? { email: trimmedEmail, password }
              : { name: trimmedName, email: trimmedEmail, password },
          ),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        const rawMessage = data.message ?? data.error;
        if (Array.isArray(rawMessage)) {
          const emailErrs = rawMessage.filter(
            (msg: string) => typeof msg === "string" && msg.toLowerCase().includes("email"),
          );
          const otherErrs = rawMessage.filter(
            (msg: string) => typeof msg !== "string" || !msg.toLowerCase().includes("email"),
          );
          if (emailErrs.length > 0) setEmailError("Email không hợp lệ.");
          if (otherErrs.length > 0) setError("Thông tin đăng ký không hợp lệ.");
        } else {
          const message = getErrorMessage(rawMessage);
          if (response.status === 409 || message.toLowerCase().includes("email")) {
            setEmailError(message);
          } else {
            setError(message);
          }
        }
        return;
      }

      const result = data as ApiResult;
      if (mode === "signup" && response.status === 201) {
        setMode("signin");
        setPassword("");
        setConfirmPassword("");
        setTerms(false);
        setSuccess("Tạo tài khoản thành công! Vui lòng đăng nhập.");
        window.setTimeout(() => passwordRef.current?.focus(), 0);
      } else {
        setSession(result.user);
        setSuccess("Đăng nhập thành công");
        router.push(result.user.role === "BARISTA" ? "/barista/dashboard" : "/products");
      }
    } catch {
      setError("Không thể kết nối BrewLite. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      {success && (
        <div className="auth-toast" role="status">
          ✓ {success}
        </div>
      )}
      <section className="auth-story">
        <div className="story-image" />
        <div className="story-scrim" />
        <div className="story-inner">
          <div className="story-top">
            <div className="story-brand">
              <span className="story-mark overflow-hidden p-0">
                <Image
                  src="/logo.png"
                  alt="BrewLite Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                />
              </span>
              <span>
                <strong>BrewLite</strong>
                <small>ESPRESSO LAB & ROASTERY</small>
              </span>
            </div>
            <span className="queue-pill">
              <i /> TAP-TO-BREW SYSTEM
            </span>
          </div>
          <div className="story-copy">
            <span className="story-kicker">
              ✦ SINGLE-ORIGIN & PRECISION ROASTED
            </span>
            <h1>Every cup is roasted with intention, pulled to precision.</h1>
            <p>
              Pre-order artisanal batch brews, craft your bespoke espresso
              ratios, and pick up your drink at peak extraction temperature.
            </p>
            <div className="metrics">
              <div>
                <strong>
                  ★ 4.98 <small>/ 5.0</small>
                </strong>
                <p>Over 45,000 artisan cups poured this month.</p>
              </div>
              <div>
                <strong>ϟ 3-Min</strong>
                <p>Barista ready guarantee upon store entry.</p>
              </div>
            </div>
          </div>
          <div className="story-footer">
            <span>⌖ SOHO ROASTERY & LAB · 424 BROOME ST, NYC</span>
            <span>● LIVE BARISTA QUEUE: 4 MIN</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="mobile-brand">
          <span className="story-mark overflow-hidden p-0">
            <Image
              src="/logo.png"
              alt="BrewLite Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-full"
            />
          </span>
          <strong>BrewLite</strong>
        </div>
        <div className="auth-card">
          <div className="auth-heading">
            <span className="maker-icon overflow-hidden p-0">
              <Image
                src="/logo.png"
                alt="BrewLite Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-full"
              />
            </span>
            <h2>
              {mode === "signin"
                ? "Chào mừng đến BrewLite"
                : "Tạo tài khoản BrewLite"}
            </h2>
            <p>
              {mode === "signin"
                ? "Đăng nhập để tiếp tục đặt cà phê."
                : "Đăng ký để bắt đầu trải nghiệm BrewLite."}
            </p>
          </div>
          <div className={`auth-tabs ${mode}`}>
            <span />
            <button type="button" onClick={() => switchMode("signin")}>
              Đăng nhập
            </button>
            <button type="button" onClick={() => switchMode("signup")}>
              Tạo tài khoản
            </button>
          </div>
          <form onSubmit={submit} className="auth-form" noValidate>
            {mode === "signup" && (
              <label>
                Họ và tên
                <div className="input-wrap">
                  <span>
                    <Icon name="user" />
                  </span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Elena Rostova"
                  />
                </div>
              </label>
            )}
            <label>
              Email
              <div className="input-wrap">
                <span>
                  <Icon name="mail" />
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="barista@brewlite.coffee"
                  type="email"
                  required
                />
              </div>
              {emailError && (
                <p className="field-error">{emailError}</p>
              )}
            </label>
            <label>
              Mật khẩu
              <div className="input-wrap">
                <span>
                  <Icon name="lock" />
                </span>
                <input
                  value={password}
                  ref={passwordRef}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    mode === "signin" ? "••••••••••••" : "Ít nhất 8 ký tự"
                  }
                  type={showPassword ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} />
                </button>
              </div>
            </label>
            {mode === "signup" && (
              <>
                <div className="strength">
                  <div>
                    <i
                      className={
                        strength.level !== "weak" ? "filled" : "filled weak"
                      }
                      style={{ backgroundColor: strength.color }}
                    />
                    <i
                      className={
                        strength.level === "medium" || strength.level === "strong"
                          ? "filled"
                          : "filled muted"
                      }
                      style={{
                        backgroundColor:
                          strength.level === "medium" || strength.level === "strong"
                            ? strength.color
                            : undefined,
                      }}
                    />
                    <i
                      className={
                        strength.level === "strong" ? "filled" : "filled muted"
                      }
                      style={{
                        backgroundColor:
                          strength.level === "strong"
                            ? strength.color
                            : undefined,
                      }}
                    />
                  </div>
                  <span>{strength.label}</span>
                </div>
                <label>
                  Xác nhận mật khẩu
                  <div className="input-wrap">
                    <span>
                      <Icon name="refresh" />
                    </span>
                    <input
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Nhập lại mật khẩu"
                      type={showPassword ? "text" : "password"}
                      required
                    />
                  </div>
                </label>
                <label className="check-row">
                  <input
                    checked={terms}
                    onChange={(event) => setTerms(event.target.checked)}
                    type="checkbox"
                  />{" "}
                  <span>
                    Tôi đồng ý với <u>điều khoản sử dụng</u> và{" "}
                    <u>chính sách bảo mật</u>.
                  </span>
                </label>
              </>
            )}
            {error && <p className="form-error">⚠ {error}</p>}
            <button className="submit-button" disabled={loading} type="submit">
              {loading
                ? "Đang xử lý..."
                : mode === "signin"
                  ? "Đăng nhập →"
                  : "Tạo tài khoản ✦"}
            </button>
          </form>
          <div className="divider">
            <span>or continue with</span>
          </div>
          <div className="socials">
            <button type="button">G Google</button>
            <button type="button">● Apple</button>
          </div>
        </div>
        <footer className="security">
          ◉ 256-Bit TLS Encrypted · OAuth 2.0 / NestJS Verified
        </footer>
      </section>
    </main>
  );
}
