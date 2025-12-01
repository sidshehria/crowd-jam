"use client";

import { WordCloudData } from "@/lib/types";

interface WordCloudProps {
  data: WordCloudData;
  size?: "small" | "large";
}

export default function WordCloud({ data, size = "small" }: WordCloudProps) {
  if (!data.words || data.words.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Live Word Cloud</h3>
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">No words yet</p>
          <p className="text-sm text-gray-400">Start chatting or submitting suggestions!</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.words.map((w) => w.count));
  const minSize = size === "large" ? 16 : 12;
  const maxSize = size === "large" ? 48 : 32;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Live Word Cloud</h3>
      <div
        className={`flex flex-wrap gap-2 justify-center items-center ${
          size === "large" ? "min-h-[300px]" : "min-h-[200px]"
        }`}
      >
        {data.words.slice(0, size === "large" ? 50 : 30).map((word, index) => {
          const fontSize =
            minSize + ((word.count / maxCount) * (maxSize - minSize));
          const opacity = 0.6 + (word.count / maxCount) * 0.4;
          return (
            <span
              key={`${word.text}-${index}`}
              className="inline-block px-2 py-1 text-purple-600 font-medium transition-all hover:scale-110 cursor-default"
              style={{
                fontSize: `${fontSize}px`,
                opacity,
              }}
              title={`${word.count} occurrence${word.count > 1 ? "s" : ""}`}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}

