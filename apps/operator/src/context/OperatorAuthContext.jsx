"use client";
import { createContext, useContext, useState, useEffect } from "react";

const OperatorAuthContext = createContext(null);

export function OperatorAuthProvider({ children }) {
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => { if (data.operator) setOperator(data.operator); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOperator(null);
    window.location.href = "/login";
  }

  return (
    <OperatorAuthContext.Provider value={{ operator, loading, setOperator, logout }}>
      {children}
    </OperatorAuthContext.Provider>
  );
}

export function useOperatorAuth() {
  return useContext(OperatorAuthContext);
}
