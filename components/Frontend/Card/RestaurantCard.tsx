import React, { useRef } from 'react';
import Link from 'next/link';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import dayjs from 'dayjs';

export default function RestaurantCard({
  rid,
  rName,
  rLocation,
  images,
  fixDate,
}) {
  const linkpath = '/restaurant/' + rid;
  const resName = rName;
  const resLocation = rLocation;
  return (
    <div className='relative flex flex-col restaurant-card max-w-xl mb-12 cursor-pointer mx-auto w-full'>
      <Link href={linkpath}>
        <div className='mb-6 w-full'>
          {/* <Swiper
                    spaceBetween={0}
                    slidesPerView={1}
                >
                    {
                        images.map((i, key) => {
                            return <SwiperSlide key={key}><img className="mx-auto rounded-lg" src={i.FILE_PATH} alt="" /></SwiperSlide>
                        })
                    }

                </Swiper> */}
          <img
            src={images[0].FILE_PATH}
            alt='Restaurant Image'
            className='mx-auto rounded-lg w-full h-56'
          />
        </div>

        <div>
          <span className='font-bold'>
            {resName}
            {fixDate && ` วันที่ ${dayjs(fixDate).format('DD/MM/YYYY')}`}
          </span>
          <div className='flex space-x-2 items-center'>
            <div className='text-secondary'>
              <i className='fas fa-map-marker-alt'></i>
            </div>
            <div>
              <p>{resLocation}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
