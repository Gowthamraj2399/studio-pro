import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const signInMutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signInMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="material-symbols-outlined text-4xl text-primary">photo_camera</span>
            <h1 className="text-2xl font-black tracking-tight">StudioPro</h1>
          </div>
          <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Sign in</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Enter your email and password to continue.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            {signInMutation.error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {signInMutation.error.message}
              </div>
            )}
            <button
              type="submit"
              disabled={signInMutation.isPending}
              className="w-full h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-slate-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {signInMutation.isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
