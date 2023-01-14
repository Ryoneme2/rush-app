/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import Link from 'next/link';

import Default from 'layouts/Default';

// import EventCard from "components/Frontend/Card/CardEventCard";
import RestaurantCard from 'components/Frontend/Card/RestaurantCard';
import { useRouter } from 'next/router';
import {
  PrismaClient,
  RESTAURANT,
  RESTAURANT_CONTACT,
  RESTAURANT_GALLERY,
  RESTAURANT_MUSIC_STYLE,
  RESTAURANT_CATEGORIES,
} from '@prisma/client';

// import Swiper JS
// import { Swiper, SwiperSlide } from 'swiper/react';
// import Swiper styles
import 'swiper/css';
import { useSession } from 'next-auth/react';

function Index({
  data,
}: {
  data: (RESTAURANT & {
    RESTAURANT_CATEGORIES: RESTAURANT_CATEGORIES;
    RESTAURANT_CONTACT: RESTAURANT_CONTACT[];
    RESTAURANT_GALLERY: RESTAURANT_GALLERY[];
    RESTAURANT_MUSIC_STYLE: RESTAURANT_MUSIC_STYLE[];
  })[];
}) {
  console.log(data);

  return (
    <div className='px-6 '>
      <section className='w-full flex flex-wrap items-center justify-between'>
        <div className='container mx-auto flex flex-wrap items-center '>
          <div className='relative flex justify-between w-full flex-wrap font-bold mb-6 mt-8'>
            <p className='text-xl'>Open for booking now</p>
          </div>

          <div className='w-full'>
            <div className='grid xs:grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 xs:mb-10 md:mb-0'>
              {data.map((e, key) => {
                if (e.RESTAURANT_GALLERY.length > 0) {
                  return (
                    <RestaurantCard
                      key={key}
                      rid={e.ID}
                      rName={e.NAME}
                      rLocation={e.ADDRESS}
                      images={e.RESTAURANT_GALLERY}
                      fixDate={e.FIX_DATE}
                    />
                  );
                }
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export async function getServerSideProps() {
  const prisma = new PrismaClient();

  const response = await prisma.rESTAURANT.findMany({
    where: { IS_ACTIVE: true },
    include: {
      RESTAURANT_CATEGORIES: true,
      RESTAURANT_CONTACT: true,
      RESTAURANT_GALLERY: { where: { IS_ACTIVE: true } },
      RESTAURANT_MUSIC_STYLE: true,
    },
    orderBy: [{ ID: 'asc' }],
  });
  await prisma.$disconnect();

  const data = JSON.parse(JSON.stringify(response));

  return { props: { data } };
}

Index.layout = Default;

export default Index;
{
  /* <div className="relative flex justify-between w-full flex-wrap font-bold mb-6">
            <p className=" text-2xl">Upcoming events</p>
            <Link href="/">
              <a>See all</a>
            </Link>
          </div>
          <div className="w-full">
            <Swiper
              spaceBetween={0}
              slidesPerView={2.1}
              breakpoints={{
                800: {
                  slidesPerView: 3.3,
                  spaceBetween: 10
                },
                // when window width is >= 480px
                1028: {
                  slidesPerView: 4.3,
                  spaceBetween: 24
                },
                // when window width is >= 1280px
                1280: {
                  slidesPerView: 6,
                  spaceBetween: 24
                }
              }}
              onSwiper={() => { }}
            >
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>
              <SwiperSlide><EventCard /></SwiperSlide>

            </Swiper>

          </div> */
}
