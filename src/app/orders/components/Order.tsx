"use client";
import Image from "next/image";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { twMerge } from "tailwind-merge"

import { IOrder } from "@/interface";
import { formatPrice } from "@/utils/format-price";
import { formatDiscountPrice } from "@/utils/format-discount";

interface OrderProps {
  order: IOrder;
  position: number;
}

export function Order({ order, position }: OrderProps) {
  const [showDetails, setShowDetails] = useState(false);
  const orderDetails = showDetails ? "border-[#2A2A2A] max-h-screen" : "border-transparent max-h-0 overflow-hidden";

  const toggleOrderDetails = () => setShowDetails((state) => !state)

  return (
    <div className="p-4 rounded-xl border-[#2A2A2A] border-2">
      <header className="flex items-center justify-between py-4">
        <div className="flex flex-col">
          <strong className="text-white text-sm">Número do pedido</strong>
          <span className="text-[#A1A1A1] text-xs">
            #{position.toString().padStart(3, "0")}
          </span>
        </div>

        <button onClick={toggleOrderDetails} className="flex items-center gap-4">
          {!showDetails ? (
            <ArrowDown className="text-[#8162FF]" size={20} />
          ) : (
            <ArrowUp className="text-[#8162FF]" size={20} />
          )}
          <strong className="hidden text-[#8162FF] text-sm md:block">
            Detalhes do Pedido
          </strong>
        </button>
      </header>

      <div className={twMerge("border-t-2 transition-all ease-in-out", orderDetails)}>
        {order.orderItems.map((orderItem) => {
          const { product } = orderItem;

          const priceDiscounted = formatDiscountPrice(
            product.coupon?.discount,
            product.price
          );

          return (
            <div
              className="mt-8 flex justify-between items-center"
              key={orderItem.id}
            >
              <div className="flex">
                <div className="bg-[#1A1A1A] p-4 rounded-md flex justify-center items-center h-[110px] mr-4">
                  <Image
                    src={product.image.url}
                    alt={product.name}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-[91px] h-[91px]"
                  />
                </div>

                <div className="flex flex-col justify-evenly">
                  <p className="text-white rounded-sm text-sm">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-lg">
                      {formatPrice(priceDiscounted)}
                    </strong>
                  </div>

                  <small className="text-[#A1A1A1] text-xs">
                    Quantidade: {orderItem.quantity}
                  </small>
                </div>
              </div>
            </div>
          );
        })}

        <ul className="mt-8 flex flex-col gap-4 text-white">
          <li className="border-b-[2px] border-[#2A2A2A] pb-4 flex items-center justify-between text-sm">
            <span>Data</span>
            <span>{Intl.DateTimeFormat("pt-Br").format(new Date())}</span>
          </li>
          <li className="flex items-center justify-between text-base">
            <strong>Total</strong>
            <strong>{formatPrice(order.total)}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
}