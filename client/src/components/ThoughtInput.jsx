// client/src/components/ThoughtInput.jsx
import React, { useState } from "react";

/**
 * ThoughtInput
 * - floating icon
 * - Enter to submit
 * - subtle input focus microinteraction
 */
export default function ThoughtInput({ onAddThought }) {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const submit = (e) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    if (typeof onAddThought === "function") onAddThought(trimmed);
    setText("");
    setIsFocused(false);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-4xl mx-auto">
      <div
        className={`flex items-center gap-3 p-3 rounded-2xl border transition
          ${isFocused ? "ring-2 ring-indigo-500 border-indigo-600 bg-[#071227]/60" : "border-transparent bg-[rgba(255,255,255,0.02)]"}`}
      >
        {/* decorative left icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#7c3aed] to-[#60a5fa] shadow-md">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3C7 3 3 6.58 3 11c0 2.4 1.1 4.6 2.9 6.05L6 21l3.1-1.1C10.4 20 11.2 20 12 20c5 0 9-3.58 9-8s-4-9-9-9z" fill="rgba(255,255,255,0.9)"/>
          </svg>
        </div>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {/* keep focused ring for microinteractions until submit */}}
          placeholder="Type a thought and press Enter or click Add..."
          aria-label="New thought"
          className="flex-1 bg-transparent placeholder:text-gray-400 text-white text-lg outline-none"
          onKeyDown={(e) => {
            if (e.key === "Escape") { setText(""); setIsFocused(false); }
            if (e.key === "Enter" && !e.shiftKey) submit(e);
          }}
        />

        {/* Add button */}
        <button
          type="submit"
          className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 hover:scale-105 transform transition shadow-lg text-white font-semibold"
          title="Add thought"
        >
          Add
        </button>
      </div>

      {/* optional small hint / microcopy */}
      <div className="mt-2 text-sm text-gray-400 max-w-4xl mx-auto pl-2">
        Tip: Press <span className="font-medium text-indigo-200">Enter</span> to save quickly. Esc to clear.
      </div>
    </form>
  );
}
