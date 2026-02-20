import React, { useState } from "react";

export const CloudinarySetupGuide: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-10 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-lg font-bold text-slate-900 dark:text-white">
          How to get Cloudinary credentials
        </span>
        <span
          className={`material-symbols-outlined text-2xl text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 pt-0 border-t border-slate-200 dark:border-gray-800">
          <ol className="list-decimal list-inside space-y-3 text-sm text-slate-700 dark:text-gray-300">
            <li>
              Open the{" "}
              <a
                href="https://console.cloudinary.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Cloudinary Dashboard
              </a>
              .
            </li>
            <li>
              Go to <strong>Settings → Upload → Upload presets</strong>.
            </li>
            <li>
              Click <strong>Add upload preset</strong> and set <strong>Signing Mode</strong> to{" "}
              <strong>Unsigned</strong>.
            </li>
            <li>
              Save the preset and note its <strong>name</strong> — that is your <strong>Upload preset</strong> value.
            </li>
            <li>
              Your <strong>Cloud name</strong> is shown in the dashboard (top of the page or in Settings).
            </li>
          </ol>
          <p className="mt-4 text-sm text-slate-500 dark:text-gray-400">
            Enter both values above and save. Leave them empty to use the app default (if configured in environment).
          </p>
        </div>
      )}
    </section>
  );
};
