// components/admin/FloatingAutosaveIndicator.tsx
"use client";

interface FloatingAutosaveIndicatorProps {
  autosaving: boolean;
  lastLocalSave?: number | null;
  lastServerSave?: number | null;
  timeUntilNextSave?: number | null; // 👈 NEW
  docked: boolean;
}


export default function FloatingAutosaveIndicator({
  autosaving,
  lastLocalSave,
  lastServerSave,
  timeUntilNextSave,
  docked,
}: FloatingAutosaveIndicatorProps) {
  return (
   <div
      className={`flex items-center`}
    >

      <AutosaveBubble
        autosaving={autosaving}
        lastLocalSave={lastLocalSave}
        lastServerSave={lastServerSave}
        timeUntilNextSave={timeUntilNextSave}
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
  timeUntilNextSave,
  forceOpen = false,
}: {
  autosaving: boolean;
  lastLocalSave?: number | null;
  lastServerSave?: number | null;
  timeUntilNextSave?: number | null;
  forceOpen?: boolean;
}) {

const shouldOpen = forceOpen;

  return (
    <div
      className="
        autosave-bubble-sm
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
    autosave-expanded
    absolute left-0 top-1/2
    -translate-y-1/2
    h-10
    flex items-center
    rounded-full
    bg-white border border-[#D8CDBE] shadow-md
    overflow-hidden
    origin-left transform
    transition-[opacity,transform] duration-150 ease-out
    pl-7 pr-3
    whitespace-nowrap
    ${shouldOpen
      ? "opacity-100 scale-x-100"
      : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
    }
  `}
>


<span className="autosave-bubble-text-sm text-xs text-[#4A3820] flex items-center gap-1">

  {autosaving && "Autosaving…"}

  {!autosaving &&
    lastLocalSave &&
    typeof timeUntilNextSave === "number" &&
    timeUntilNextSave > 0 && (
      <>
        <span>Draft saved locally</span>
        <span className="opacity-60">·</span>
        <span className="opacity-70">
          Cloud sync in {formatDuration(timeUntilNextSave)}
        </span>
      </>
    )}

  {!autosaving &&
    typeof timeUntilNextSave === "number" &&
    timeUntilNextSave <= 0 &&
    lastServerSave && (
      <>Cloud draft saved · {timeAgo(lastServerSave)}</>
    )}

  {!autosaving &&
    timeUntilNextSave == null &&
    lastLocalSave && <span>Draft saved locally</span>}
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

function formatDuration(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
