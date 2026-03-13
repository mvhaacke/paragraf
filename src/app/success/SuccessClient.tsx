"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface Props {
  email: string;
  caseId: string;
  loginUrl: string;
}

export function SuccessClient({ email, loginUrl }: Props) {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(timer);
          window.location.href = loginUrl;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loginUrl]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm text-center space-y-6">

        <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-900">
            Zahlung bestätigt
          </h1>
          <p className="text-sm text-gray-500">
            Ihre Rechnung wurde an <strong>{email}</strong> gesendet.
            Ihr Dokument wird jetzt erstellt.
          </p>
        </div>

        <div className="border border-gray-100 rounded-xl p-4 text-left space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Was jetzt passiert
          </p>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5">1.</span>
              Dokument wird für Sie ausgefüllt
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5">2.</span>
              Sie werden zu Ihrem Dashboard weitergeleitet
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5">3.</span>
              Genaue Einreichungsanleitung wartet dort auf Sie
            </li>
          </ul>
        </div>

        <button
          onClick={() => { window.location.href = loginUrl; }}
          className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Zum Dashboard ({countdown})
        </button>

      </div>
    </main>
  );
}
