"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, FileCode2, Database } from "lucide-react";

export default function Home() {
  const features = [
    {
      name: "QuickBooks Integration",
      description:
        "Sync invoices, bills, and payments securely between QuickBooks Online and internal systems using OAuth 2.0.",
      icon: FileCode2,
    },
    {
      name: "Bill.com Automation",
      description:
        "Automate payable workflows using Spend and Expense APIs with secure token management.",
      icon: Database,
    },
    {
      name: "Zapier Workflows",
      description:
        "Connect CRMs, finance tools, and analytics pipelines with automated triggers and actions.",
      icon: Zap,
    },
    {
      name: "Security & Compliance",
      description:
        "Tokenized authentication, server-only keys, and secure API routing keep all integrations protected.",
      icon: ShieldCheck,
    },
  ];

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-20 text-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl text-center"
      >
        <h1 className="text-4xl font-semibold tracking-tight mb-4 text-gray-900">
          Integration Management Hub
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          A secure workspace to manage automations and API connections between
          QuickBooks, Bill.com, Zapier, and internal systems.
        </p>
      </motion.div>

      <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full px-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const getLink = (name: string) => {
            switch (name) {
              case "QuickBooks Integration":
                return "/integrations/quickbooks";
              case "Bill.com Automation":
                return "/integrations/billcom";
              case "Zapier Workflows":
                return "/integrations";
              case "Security & Compliance":
                return "/integrations";
              default:
                return "/integrations";
            }
          };
          
          return (
            <motion.a
              key={feature.name}
              href={getLink(feature.name)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-white shadow-sm hover:shadow transition-all duration-300 p-6 flex flex-col cursor-pointer group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-200 text-gray-700 mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                {feature.name}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-4 text-xs text-blue-600 font-medium group-hover:text-blue-700">
                Explore Integration →
              </div>
            </motion.a>
          );
        })}
      </div>

      <footer className="mt-20 text-xs text-gray-400">
        © {new Date().getFullYear()} Integration Hub
      </footer>
    </main>
  );
}
