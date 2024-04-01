'use client'
import { HTMLAttributes } from 'react'
import { Package, Truck } from 'lucide-react'
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { twMerge } from 'tailwind-merge'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'

type CarouselDivProps = HTMLAttributes<HTMLElement>

export function Benefits({ className }: CarouselDivProps) {
  return (
    <Swiper
      modules={[Navigation, Pagination, A11y, Autoplay]}
      spaceBetween={12}
      autoplay={{ delay: 2500 }}
      loop
      className={twMerge('w-full', className)}
      breakpoints={{
        320: { slidesPerView: 1 },
        728: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
    >
      <SwiperSlide>
        <div className="rounded-md py-6 px-4 flex items-center justify-center gap-4 text-base  text-white bg-[#1A1A1A]">
          <Truck />
          <strong>Entrega rápida</strong>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="rounded-md py-6 px-4 flex items-center justify-center gap-2 text-base  text-white bg-[#1A1A1A]">
          <Package />
          <strong>Compre com desconto</strong>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="rounded-md py-6 px-4 flex items-center justify-center gap-4 text-base  text-white bg-[#1A1A1A]">
          <Package />
          <strong>Pague no Pix ou Retire na loja</strong>
        </div>
      </SwiperSlide>
    </Swiper>
  )
}
