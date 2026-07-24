export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline leading-none ${className}`}>
      <span className="font-serif italic tracking-tight text-[1.6em]">A</span>
      <span className="font-script -ml-[0.05em]">ulonaclothing</span>
    </span>
  );
}
