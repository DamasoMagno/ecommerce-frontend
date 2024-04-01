export function formatPrice(price: number) {
  const priceFormatted = Intl.NumberFormat('pt-Br', {
    currency: 'BRL',
    style: 'currency',
  }).format(price)

  return priceFormatted
}
