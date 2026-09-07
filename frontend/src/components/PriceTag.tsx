import { discountPercentOff, formatPrice, hasActiveDiscount } from "../utils/formatCurrency";
import "./PriceTag.css";

export function PriceTag({
  price,
  discountPrice,
  size = "md",
}: {
  price: number | null | undefined;
  discountPrice: number | null | undefined;
  size?: "sm" | "md" | "lg";
}) {
  if (!hasActiveDiscount(price, discountPrice)) {
    return <span className={`price-tag price-tag--${size}`}>{formatPrice(price)}</span>;
  }

  const percentOff = discountPercentOff(price as number, discountPrice as number);

  return (
    <span className={`price-tag price-tag--${size} price-tag--discounted`}>
      <span className="price-tag__discount">{formatPrice(discountPrice)}</span>
      <span className="price-tag__original">{formatPrice(price)}</span>
      <span className="price-tag__badge">{percentOff}% off</span>
    </span>
  );
}
