"use client";
import { Check } from "lucide-react";

const steps = [
  { label: "Search", step: 1 },
  { label: "Select Bus", step: 2 },
  { label: "Choose Seats", step: 3 },
  { label: "Book", step: 4 },
];

export default function ProgressStepper({ currentStep }) {
  return (
    <div className="w-full bg-white border-b border-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          {steps.map((s, i) => (
            <div key={s.step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                    s.step < currentStep
                      ? "bg-blue-600 border-blue-600 text-white"
                      : s.step === currentStep
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {s.step < currentStep ? <Check size={14} /> : s.step}
                </div>
                <span
                  className={`mt-1 text-xs font-medium hidden sm:block ${
                    s.step <= currentStep ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 w-16 sm:w-24 mx-2 transition-all ${
                    s.step < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
