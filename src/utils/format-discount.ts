export function formatDiscountPrice(
  percentage: number | undefined,
  price: number,
) {
  const discount = percentage ? percentage / 100 : 0
  const priceDiscounted = price - discount * price

  return priceDiscounted
}
