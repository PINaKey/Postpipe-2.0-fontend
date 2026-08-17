import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-6", className)}
      viewBox="0 0 500 500"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PostPipe Logo"
    >
      <path
        fillRule="evenodd"
        d="m105 9l338.9 57.7c-292.3 108.5-331 394.6-331.6 429.2z"
      />
    </svg>
  );
}
