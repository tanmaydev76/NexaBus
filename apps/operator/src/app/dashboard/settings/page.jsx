"use client";
import { useState, useEffect } from "react";
import { Building2, CreditCard, Lock, Save } from "lucide-react";
import toast from "react-hot-toast";

const TABS = [
  { id: "company",  label: "Company Profile", icon: Building2 },
  { id: "payments", label: "Bank & Payments",  icon: CreditCard },
  { id: "security", label: "Security",         icon: Lock },
];

function PasswordField({ label, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input type="password" value={value} onChange={onChange}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${error ? "border-red-400" : "border-slate-200"}`} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function InputRow({ label, value, onChange, type = "text", placeholder, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:bg-slate-50 disabled:text-slate-400" />
    </div>
  );
}

function CompanyTab({ operator }) {
  const [form, setForm] = useState({
    companyName: operator?.companyName || "",
    email: operator?.email || "",
    phone: operator?.phone || "",
    address: operator?.address || "",
    city: operator?.city || "",
    state: operator?.state || "",
    pincode: operator?.pincode || "",
    gstNumber: operator?.gstNumber || "",
    website: operator?.website || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/operator/settings/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      toast.success("Company profile updated!");
    } catch { toast.error("Failed to save settings"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputRow label="Company Name" value={form.companyName} onChange={set("companyName")} placeholder="Your Bus Company" />
        <InputRow label="Email" value={form.email} onChange={set("email")} type="email" placeholder="contact@company.com" />
        <InputRow label="Phone" value={form.phone} onChange={set("phone")} placeholder="+91 9876543210" />
        <InputRow label="GST Number" value={form.gstNumber} onChange={set("gstNumber")} placeholder="22AAAAA0000A1Z5" />
        <InputRow label="Website" value={form.website} onChange={set("website")} placeholder="https://yourwebsite.com" />
        <InputRow label="City" value={form.city} onChange={set("city")} placeholder="Mumbai" />
        <InputRow label="State" value={form.state} onChange={set("state")} placeholder="Maharashtra" />
        <InputRow label="Pincode" value={form.pincode} onChange={set("pincode")} placeholder="400001" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
        <textarea value={form.address} onChange={set("address")} rows={3} placeholder="Full business address..."
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none" />
      </div>
      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-60">
        {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
        Save Company Profile
      </button>
    </div>
  );
}

function PaymentsTab() {
  const [form, setForm] = useState({
    accountName: "", bankName: "", accountNumber: "", ifscCode: "",
    upiId: "", razorpayKey: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/operator/settings/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      toast.success("Payment settings saved!");
    } catch { toast.error("Failed to save settings"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Bank Account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputRow label="Account Holder Name" value={form.accountName} onChange={set("accountName")} placeholder="As per bank records" />
          <InputRow label="Bank Name" value={form.bankName} onChange={set("bankName")} placeholder="State Bank of India" />
          <InputRow label="Account Number" value={form.accountNumber} onChange={set("accountNumber")} placeholder="1234567890" />
          <InputRow label="IFSC Code" value={form.ifscCode} onChange={set("ifscCode")} placeholder="SBIN0001234" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Online Payments</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputRow label="UPI ID" value={form.upiId} onChange={set("upiId")} placeholder="company@upi" />
          <InputRow label="Razorpay Key ID" value={form.razorpayKey} onChange={set("razorpayKey")} placeholder="rzp_live_..." />
        </div>
      </div>
      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-60">
        {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
        Save Payment Settings
      </button>
    </div>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleChange = async () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = "Required";
    if (!form.newPassword || form.newPassword.length < 8) e.newPassword = "Min 8 characters";
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      const r = await fetch("/api/operator/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      toast.success("Password changed!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-md space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Change Password</h3>
        <div className="space-y-4">
          <PasswordField label="Current Password" value={form.currentPassword} onChange={set("currentPassword")} error={errors.currentPassword} />
          <PasswordField label="New Password" value={form.newPassword} onChange={set("newPassword")} error={errors.newPassword} />
          <PasswordField label="Confirm New Password" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
        </div>
      </div>
      <button onClick={handleChange} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-60">
        {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Lock size={15} />}
        Change Password
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [operator, setOperator] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/operator/me");
        const d = await r.json();
        setOperator(d.operator);
      } catch {}
    })();
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-xl font-bold text-slate-800 mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        {activeTab === "company"  && <CompanyTab operator={operator} />}
        {activeTab === "payments" && <PaymentsTab />}
        {activeTab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}
