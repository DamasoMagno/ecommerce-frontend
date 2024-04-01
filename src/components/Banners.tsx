'use client'
import Image from 'next/image'
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { IBanner } from '@/interface'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'

interface SlidersProps {
  banners: IBanner[]
}

export function Banners({ banners }: SlidersProps) {
  return (
    <Swiper
      modules={[Navigation, Pagination, A11y, Autoplay]}
      loop
      slidesPerView={1}
      autoplay={{
        delay: 2500,
      }}
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.id} className="relative max-h-[500px]">
          <Image
            src={banner.image.url}
            height={0}
            width={0}
            sizes="100vw"
            alt=""
            className="object-contain w-full h-full"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
