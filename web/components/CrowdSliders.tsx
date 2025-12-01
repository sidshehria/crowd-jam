"use client";

import { useState, useEffect } from "react";
import { CrowdSliderSummary } from "@/lib/types";

interface CrowdSlidersProps {
  summary?: CrowdSliderSummary;
  onUpdate: (tempoPreference: number, energyLevel: number) => void;
  readOnly?: boolean;
}

export default function CrowdSliders({
  summary,
  onUpdate,
  readOnly = false,
}: CrowdSlidersProps) {
  const [tempo, setTempo] = useState(120);
  const [energy, setEnergy] = useState(5);

  useEffect(() => {
    if (summary && readOnly) {
      setTempo(summary.avgTempo);
      setEnergy(summary.avgEnergy);
    }
  }, [summary, readOnly]);

  const handleTempoChange = (value: number) => {
    setTempo(value);
    if (!readOnly) {
      onUpdate(value, energy);
    }
  };

  const handleEnergyChange = (value: number) => {
    setEnergy(value);
    if (!readOnly) {
      onUpdate(tempo, value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {readOnly ? "Crowd Preferences" : "Your Preferences"}
      </h3>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Tempo (BPM)</label>
            <span className="text-sm font-semibold text-purple-600">{tempo}</span>
          </div>
          <input
            type="range"
            min="60"
            max="180"
            value={tempo}
            onChange={(e) => handleTempoChange(Number(e.target.value))}
            disabled={readOnly}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>60</span>
            <span>180</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Energy Level</label>
            <span className="text-sm font-semibold text-purple-600">{energy}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => handleEnergyChange(Number(e.target.value))}
            disabled={readOnly}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
        {readOnly && summary && (
          <p className="text-xs text-gray-500 text-center">
            Based on {summary.voterCount} {summary.voterCount === 1 ? "vote" : "votes"}
          </p>
        )}
      </div>
    </div>
  );
}

