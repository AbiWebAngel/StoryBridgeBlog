// components/admin/FloatingAutosaveIndicator.tsx
"use client";

interface FloatingAutosaveIndicatorProps {
  autosaving: boolean;
  lastLocalSave?: number | null;
  lastServerSave?: number | null;
  docked: boolean;
}

export default function FloatingAutosaveIndicator({
  autosaving,
  lastLocalSave,
  lastServerSave,
  docked,
}: FloatingAutosaveIndicatorProps) {
  // Render inline — the parent (FloatingSaveBar) is responsible for positioning
  return (
    <div className="flex items-center">
      <AutosaveBubble
        autosaving={autosaving}
        lastLocalSave={lastLocalSave}
        lastServerSave={lastServerSave}
        forceOpen={docked}
      />
    </div>
  );
}

/* Autosave bubble component (keeps the same visual behavior) */
function AutosaveBubble({
  autosaving,
  lastLocalSave,
  lastServerSave,
  forceOpen = false,
}: {
  autosaving: boolean;
  lastLocalSave?: number | null;
  lastServerSave?: number | null;
  forceOpen?: boolean;
}) {
  return (
    <div
      className="
        group relative
        h-10 w-10
        rounded-full
        bg-white border border-[#D8CDBE] shadow-md
        cursor-default
        overflow-visible
      "
      aria-hidden
    >
      <div
        className={`
          absolute left-0 top-1/2
          -translate-y-1/2
          h-10
          flex items-center
          rounded-full
          bg-white border border-[#D8CDBE] shadow-md
          overflow-hidden
          transition-all duration-200 ease-out
          pl-7 pr-3
          whitespace-nowrap
          ${forceOpen ? "max-w-xs opacity-100" : "max-w-10 opacity-0 group-hover:max-w-xs group-hover:opacity-100"}
        `}
      >
        <span className="text-xs text-[#4A3820]">
          {autosaving && "Autosaving…"}
          {!autosaving && lastServerSave &&
            `Cloud draft saved · ${timeAgo(lastServerSave)}`}
          {!autosaving && !lastServerSave && lastLocalSave &&
            "Draft saved locally"}
        </span>
      </div>

      <span
        className={`
          absolute inset-0 m-auto
          w-2 h-2 rounded-full
          ${autosaving ? "bg-yellow-500 animate-pulse" : ""}
          ${!autosaving && lastServerSave ? "bg-green-600" : ""}
          ${!autosaving && !lastServerSave && lastLocalSave ? "bg-gray-400" : ""}
        `}
      />
    </div>
  );
}

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
