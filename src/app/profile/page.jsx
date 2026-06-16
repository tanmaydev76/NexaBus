"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, Calendar, ChevronRight,
  Lock, Eye, EyeOff, Save, LogOut, Ticket, CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-base font-bold text-gray-900 mb-5">{title}</h2>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading, logout, updateUser, refetch } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({ name: "", phone: "", gender: "", dob: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/profile");
    }
    if (user) {
      setProfile({
        name: user.name || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dob: user.dob || "",
      });
    }
  }, [authLoading, user, router]);

  async function saveProfile(e) {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updateUser(data.user);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
    toast.success("Signed out");
  }

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Hero card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-black flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{user.name}</h1>
          <p className="text-blue-100 text-sm mt-0.5 truncate">{user.email}</p>
        </div>
        <button
          onClick={() => router.push("/my-bookings")}
          className="flex-shrink-0 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          <Ticket size={15} /> Bookings
        </button>
      </div>

      {/* Edit profile */}
      <SectionCard title="Personal Information">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* DOB */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Date of Birth</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={profile.dob}
                  onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
          >
            {savingProfile ? (
              <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /> Saving…</>
            ) : profileSuccess ? (
              <><CheckCircle size={15} /> Saved!</>
            ) : (
              <><Save size={15} /> Save Changes</>
            )}
          </button>
        </form>
      </SectionCard>

      {/* Change password */}
      <SectionCard title="Change Password">
        <form onSubmit={savePassword} className="space-y-4">
          {[
            { key: "currentPassword", label: "Current Password", field: "current" },
            { key: "newPassword", label: "New Password", field: "new" },
            { key: "confirmPassword", label: "Confirm New Password", field: "confirm" },
          ].map(({ key, label, field }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw[field] ? "text" : "password"}
                  value={passwords[key]}
                  onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={savingPw}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
          >
            {savingPw ? (
              <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /> Updating…</>
            ) : (
              <><Lock size={15} /> Update Password</>
            )}
          </button>
        </form>
      </SectionCard>

      {/* Sign out */}
      <SectionCard title="Account">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 border border-red-200 rounded-xl px-5 py-2.5 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </SectionCard>
    </div>
  );
}
