export default function LogoPlaceholder({ color, initials }) {
  return (
    <div
      style={{ backgroundColor: color }}
      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-sm flex-shrink-0"
    >
      {initials}
    </div>
  );
}
