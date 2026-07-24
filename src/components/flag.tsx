import type { ShippingCountry } from "@/lib/products";

const CODE: Record<ShippingCountry, string> = { XK: "xk", AL: "al", MK: "mk" };

export function Flag({
  code,
  className = "h-4 w-6",
}: {
  code: ShippingCountry;
  className?: string;
}) {
  return (
    <img
      src={`https://flagcdn.com/w80/${CODE[code]}.png`}
      srcSet={`https://flagcdn.com/w160/${CODE[code]}.png 2x`}
      alt={code}
      className={`inline-block object-cover rounded-[2px] shadow-sm ${className}`}
    />
  );
}
