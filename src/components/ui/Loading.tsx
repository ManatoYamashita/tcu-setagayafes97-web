const GEAR_D =
  "M12,4 13.75,0.94 14.61,1.11 15.06,4.61 17.66,6.34 21.06,5.42 21.55,6.15 19.39,8.94 20,12 23.06,13.75 22.89,14.61 19.39,15.06 17.66,17.66 18.58,21.06 17.85,21.55 15.06,19.39 12,20 10.25,23.06 9.39,22.89 8.94,19.39 6.34,17.66 2.94,18.58 2.45,17.85 4.61,15.06 4,12 0.94,10.25 1.11,9.39 4.61,8.94 6.34,6.34 5.42,2.94 6.15,2.45 8.94,4.61Z M16,12A4,4,0,1,0,8,12A4,4,0,1,0,16,12Z";

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      aria-hidden="true"
    >
      <path d={GEAR_D} />
    </svg>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative h-[3.75rem] w-[3.75rem]">
        <GearIcon className="absolute top-0 left-0 h-12 w-12 animate-[spin_3s_linear_infinite] text-primary-400" />
        <GearIcon className="absolute right-0 bottom-0 h-7 w-7 animate-[spin_2s_linear_infinite_reverse] text-primary-300" />
      </div>
      {label && <p className="text-sm text-gray-600">{label}</p>}
    </div>
  );
}
