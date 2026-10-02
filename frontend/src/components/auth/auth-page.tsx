"use client";

import { FormEvent, ReactNode, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

type Mode = "signin" | "signup";

type ApiResult = {
  user: { id: string; email: string; name: string; loyaltyPoints: number };
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
  return "Something went wrong. Please try again.";
}

export function AuthPage() {
  const setSession = useAuthStore((state) => state.setSession);
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  const strength = useMemo(() => {
    if (password.length >= 8 && /[^A-Za-z0-9]/.test(password))
      return { level: "strong", label: "Strong roast", color: "#10B981" };
    if (
      password.length >= 6 &&
      (/[A-Z]/.test(password) || /[0-9]/.test(password))
    )
      return { level: "medium", label: "Medium roast", color: "#F59E0B" };
    return {
      level: "weak",
      label: password ? "Weak roast" : "Enter password",
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
    if (mode === "signup" && password !== confirmPassword)
      return setError("Passwords do not match.");
    if (mode === "signup" && !terms)
      return setError(
        "Please agree to the Roastery Terms and Privacy Standards.",
      );
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/auth/${mode === "signin" ? "login" : "register"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "signin" ? { email, password } : { name, email, password },
          ),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        const message = getErrorMessage(data.message ?? data.error);
        if (mode === "signup") {
          setEmailError(message);
        } else {
          setError(message);
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
        setSession(result.user, result.accessToken);
        setSuccess(
          "Authentication verified! Connecting to espresso counter...",
        );
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to connect to BrewLite.",
      );
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
              <span className="story-mark">
                <Icon name="coffee" className="brand-icon" />
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
          <span className="story-mark">
            <Icon name="coffee" className="brand-icon" />
          </span>
          <strong>BrewLite</strong>
        </div>
        <div className="auth-card">
          <div className="auth-heading">
            <span className="maker-icon">
              <Icon name="coffee" className="maker-icon-svg" />
            </span>
            <h2>
              {mode === "signin"
                ? "Welcome to BrewLite"
                : "Join the Roastery Club"}
            </h2>
            <p>
              {mode === "signin"
                ? "Sign in to access your saved roast notes and quick tap-to-brew cart."
                : "Unlock complimentary first pour, seasonal roast drops & VIP skip-the-line."}
            </p>
          </div>
          <div className={`auth-tabs ${mode}`}>
            <span />
            <button type="button" onClick={() => switchMode("signin")}>
              Sign In
            </button>
            <button type="button" onClick={() => switchMode("signup")}>
              Create Account
            </button>
          </div>
          <form onSubmit={submit} className="auth-form" noValidate>
            {mode === "signup" && (
              <label>
                Full Name
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
              {mode === "signin" ? "Coffee ID or Email" : "Coffee Lover Email"}
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
              {mode === "signup" && emailError && (
                <p className="field-error">{emailError}</p>
              )}
            </label>
            <label>
              {mode === "signin" ? "Roast Passkey" : "Create Password"}
              <div className="input-wrap">
                <span>
                  <Icon name="lock" />
                </span>
                <input
                  value={password}
                  ref={passwordRef}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    mode === "signin" ? "••••••••••••" : "At least 8 characters"
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
                        strength.level === "strong" ? "filled" : "filled muted"
                      }
                      style={{
                        backgroundColor:
                          strength.level === "strong"
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
                  Confirm Password
                  <div className="input-wrap">
                    <span>
                      <Icon name="refresh" />
                    </span>
                    <input
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Re-type your password"
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
                    I agree to the <u>Roastery Terms</u> &{" "}
                    <u>Privacy Standards</u>.
                  </span>
                </label>
              </>
            )}
            {mode === "signin" && (
              <label className="check-row">
                <input
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  type="checkbox"
                />{" "}
                <span>Stay signed in for quick tap order</span>
              </label>
            )}
            {error && <p className="form-error">⚠ {error}</p>}
            <button className="submit-button" disabled={loading} type="submit">
              {loading
                ? "Brewing..."
                : mode === "signin"
                  ? "Sign In & Brew →"
                  : "Create Account & Claim First Brew ✦"}
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
