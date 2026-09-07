const formatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return "Contact us for pricing";
  return formatter.format(price);
}

/** A discount only counts as active when it's a real, positive markdown off the regular price. */
export function hasActiveDiscount(price: number | null | undefined, discountPrice: number | null | undefined): boolean {
  return price != null && discountPrice != null && discountPrice > 0 && discountPrice < price;
}

export function discountPercentOff(price: number, discountPrice: number): number {
  return Math.round(((price - discountPrice) / price) * 100);
}
