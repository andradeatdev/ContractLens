import * as icons from "simple-icons";

export function SimpleIcon({ name, className }: { name: string, className?: string }) {
  const icon = (icons as any)[`si${name}`];
  if (!icon) return null;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={icon.path} />
    </svg>
  );
}
