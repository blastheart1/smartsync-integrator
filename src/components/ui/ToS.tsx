"use client";

import { useState, useEffect } from "react";

interface ToSModalProps {
  onAgree?: () => void;
}

export default function ToSModal({ onAgree }: ToSModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const hasAgreed = typeof window !== "undefined" && localStorage.getItem("tosAgreed");
      if (!hasAgreed) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const handleAgree = () => {
    try {
      localStorage.setItem("tosAgreed", "true");
    } catch {}
    setOpen(false);
    onAgree?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="relative w-[95vw] max-w-lg max-h-[95dvh] overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="px-5 pt-5">
          <h2 className="text-xl font-semibold text-gray-900">Terms of Service</h2>
        </div>

        <div className="px-5 pb-2 overflow-y-auto max-h-[70vh] space-y-4 text-sm text-gray-700">
          <p>
            This project is a personal portfolio demo intended solely to showcase software development skills.
            It is not a commercial product.
          </p>
          <p>
            This demo connects to live <strong>sandbox</strong> APIs (e.g., QuickBooks, Bill.com, Zapier, Google Sheets) to demonstrate
            real integrations. Data shown is retrieved from these sandbox services in real time and is <strong>not </strong>
            mock or hardcoded data. HubSpot and Salesforce integrations are coming soon.
          </p>
          <p>
            When you upload or enter data, it may be processed temporarily and is not stored or shared.
            Some processing may involve third-party services which may apply their own terms.
          </p>
          <p>
            You retain ownership of your data. Please do not use this demo for sensitive, financial, medical, or legal information.
          </p>
          <p>
            This project is provided as-is without warranties of any kind. Access may be discontinued at any time.
          </p>
          <div>
            <div className="font-medium text-gray-900 mb-1">Data sources (sandbox):</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <a
                  href="https://developer.intuit.com/app/developer/qbo/docs/develop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  QuickBooks Online API Docs
                </a>
              </li>
              <li>
                <a
                  href="https://developer.bill.com/docs/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Bill.com v3 API Docs
                </a>
              </li>
              <li>
                <a
                  href="https://platform.zapier.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Zapier Platform Docs
                </a>
              </li>
              <li>
                <a
                  href="https://developers.google.com/sheets/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Sheets API Docs
                </a>
              </li>
              <li>
                <a
                  href="https://developers.hubspot.com/docs/api/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  HubSpot API Docs (Coming Soon)
                </a>
              </li>
              <li>
                <a
                  href="https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Salesforce REST API Docs (Coming Soon)
                </a>
              </li>
            </ul>
          </div>
          <p>
            By clicking <strong>I Agree and Continue</strong>, you confirm that you understand and accept these terms.
          </p>
        </div>

        <div className="p-5">
          <button
            onClick={handleAgree}
            className="w-full rounded-xl px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            I Agree and Continue
          </button>
        </div>
      </div>
    </div>
  );
}


