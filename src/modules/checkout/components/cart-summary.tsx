'use client'
import { useCart } from '@/context/Cart'
import { useCartPrice } from '@/hooks/useCartPrice'
import { formatPrice } from '@/utils/format-price'

export function CartSummary({ includeDelivery = true }: { includeDelivery?: boolean }) {
  const { payment, orderItems } = useCart()
  const { cartFormatted } = useCartPrice()
  const delivery = includeDelivery && orderItems.length > 0 && payment.delivery === 'Entrega' ? 5 : 0
  return <dl className="space-y-3 text-sm text-muted-ink">
    {includeDelivery && <><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(cartFormatted.total)}</dd></div><div className="flex justify-between"><dt>{payment.delivery === 'Retirada' ? 'Retirada na loja' : 'Entrega'}</dt><dd>{delivery ? formatPrice(delivery) : 'Grátis'}</dd></div></>}
    {cartFormatted.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Você economizou</dt><dd>{formatPrice(cartFormatted.discount)}</dd></div>}
    <div className={`flex items-center justify-between text-ink ${includeDelivery || cartFormatted.discount > 0 ? 'border-t border-border pt-4' : ''}`}><dt className="font-bold">{includeDelivery ? 'Total' : 'Subtotal dos produtos'}</dt><dd className="text-xl font-bold">{formatPrice(cartFormatted.total + delivery)}</dd></div>
    {!includeDelivery && <p className="text-xs text-muted-ink">Escolha entrega ou retirada ao finalizar.</p>}
  </dl>
}
