"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bus, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

function Field({ label, error, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    gstNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  function validate() {
    const e = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit phone number";
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.toUpperCase())) {
      e.gstNumber = "Enter a valid 15-character GST number";
    }
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setApiError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          gstNumber: form.gstNumber.toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error || "Signup failed"); return; }
      router.push("/dashboard");
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
      errors[field] ? "border-red-400" : "border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3">
            <Bus size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Register as Operator</h1>
          <p className="text-sm text-gray-500 mt-1">Start managing your bus fleet on NexaBus</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {apiError}
              </div>
            )}

            {/* Company + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Company Name *" error={errors.companyName}>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={update("companyName")}
                  placeholder="Sharma Travels Pvt. Ltd."
                  autoFocus
                  className={inputClass("companyName")}
                />
              </Field>
              <Field label="Email Address *" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="ops@company.com"
                  className={inputClass("email")}
                />
              </Field>
            </div>

            {/* Phone + GST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone Number *" error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="9876543210"
                  maxLength={10}
                  className={inputClass("phone")}
                />
              </Field>
              <Field
                label="GST Number *"
                error={errors.gstNumber}
                hint="15-character GST registration number"
              >
                <input
                  type="text"
                  value={form.gstNumber}
                  onChange={(e) => setForm((p) => ({ ...p, gstNumber: e.target.value.toUpperCase() }))}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                  className={`${inputClass("gstNumber")} font-mono tracking-wider`}
                />
              </Field>
            </div>

            {/* Password */}
            <Field label="Password *" error={errors.password}>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Min. 6 characters"
                  className={`${inputClass("password")} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            <Field label="Confirm Password *" error={errors.confirmPassword}>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                placeholder="Re-enter password"
                className={inputClass("confirmPassword")}
              />
            </Field>

            {/* Terms note */}
            <p className="text-xs text-gray-400 leading-relaxed">
              By signing up you agree to NexaBus&apos;s operator terms of service. Your account will be reviewed for verification after sign-up.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creating account…" : "Create Operator Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
