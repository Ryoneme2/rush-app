import React, { createContext, useState } from 'react';

// components

import CardLineChart from 'components/Cards/CardLineChart';
import CardBarChart from 'components/Cards/CardBarChart';
import CardPageVisits from 'components/Cards/CardPageVisits';
import CardSocialTraffic from 'components/Cards/CardSocialTraffic';
import DatePicker from 'sassy-datepicker';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/core.css';
import randomColor from 'randomcolor';

// layout for page
import Router, { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import BackOffice from 'layouts/BackOffice';
import CardStats from 'components/Cards/CardStats';
import { useForm } from 'react-hook-form';

// ข้อ 1
import { getSession } from 'next-auth/react';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Session } from 'next-auth';
import Cookie from 'js-cookie';

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  const session = (await getSession(context)) as Session & {
    tokenUser: string;
    fname: string;
    lname: string;
  };

  console.log({ session });

  if (!session) {
    console.log('session', session);

    return { redirect: { destination: '/auth/backoffice' } };
  }

  const secretKey: string = process.env.JWT_SECRET;
  const token = Cookie.get('next-auth.session-token');
  const user = verify(token, secretKey);
  const accountTypeId = await prisma.aCCOUNT_TYPE.findFirst({
    where: { NAME: process.env.TYPE_ADMIN_NAME },
  });
  await prisma.$disconnect();
  // เลือกทุก property
  const res = await prisma.aCCOUNT_PROFILE.findFirst({
    where: {
      ID: parseInt(user.ID),
      ACCOUNT_TYPE_ID: accountTypeId.ID,
    },
  });

  await prisma.$disconnect();

  const dataRole = await JSON.parse(JSON.stringify(res));

  if (!dataRole) {
    return { redirect: { destination: '/' } };
  }
  // ถึงตรงนี้

  const response = await prisma.rESTAURANT_MEMBERS.findMany({
    where: { IS_ACTIVE: true },
    include: {
      RESTAURANT: true,
    },
    orderBy: [{ ID: 'asc' }],
  });
  await prisma.$disconnect();

  const result = await JSON.parse(JSON.stringify(response));

  const accountTypeIdMember = await prisma.aCCOUNT_TYPE.findFirst({
    where: { NAME: process.env.TYPE_MEMBER_NAME },
  });

  const countUser = await prisma.aCCOUNT_PROFILE.groupBy({
    by: ['ACCOUNT_TYPE_ID'],
    where: { ACCOUNT_TYPE_ID: accountTypeIdMember.ID },
    _count: { ID: true },
  });
  await prisma.$disconnect();

  let count;
  if (countUser[0]?._count) {
    count = countUser[0]._count.ID;
  } else {
    count = '0';
  }

  return { props: { dropDownList: result, countUser: count } };
}

export function Dashboard(props) {
  const router = useRouter();
  const [datepickerInput, setDatepickerInput] = useState(
    // new Date(new Date().setHours(0, 0, 0, 0))
    new Date(
      new Date(new Date().setUTCHours(17, 0, 0, 0)).setUTCDate(
        new Date().getUTCDate() - 1
      )
    )
  );
  const [dataChart, setDataChart] = useState([]);
  const [dateChart, setDateChart] = useState([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [fDate, setFDate] = useState('');
  const [lDate, setLDate] = useState('');

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      Router.push('/');
    },
  }) as {
    data: Session & {
      tokenUser: string;
    };
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  let passData = [];
  let passDate = [];
  let arrDate = [];
  function setDataForChart(data, selectDate, lengthDate, area) {
    let DayMatch = [];
    let filted = [];

    for (let x = 0; x < lengthDate; x++) {
      let date = new Date(selectDate);
      arrDate.push(
        new Date(date.setDate(date.getDate() + x))
          .toISOString()
          .substring(0, 10)
      );
    }

    arrDate.map((dataDate) => {
      DayMatch.push({
        Day: dataDate,
        Data: data.filter((value) => {
          let dataA = new Date(value.BOOK_DATETIME);
          let A = new Date(dataA.setDate(dataA.getDate() + 1))
            .toISOString()
            .substring(0, 10);
          let dataB = new Date(dataDate);
          let B = new Date(dataB.setDate(dataB.getDate() + 1))
            .toISOString()
            .substring(0, 10);
          return A == B;
          // new Date(value.BOOK_DATETIME).toISOString().substring(0, 10) ==
          // dataDate
        }),
      });
    });
    let dataF = new Date(arrDate[0]);
    let f = new Date(dataF.setDate(dataF.getDate() + 1))
      .toISOString()
      .substring(0, 10);
    let dateL = new Date(arrDate[arrDate.length - 1]);
    let l = new Date(dateL.setDate(dateL.getDate() + 1))
      .toISOString()
      .substring(0, 10);
    setFDate(f);
    setLDate(l);

    DayMatch.map((DM) => {
      filted.push({
        Day: DM.Day,
        data: DM.Data.map((dataData) =>
          area.map((dataA) => {
            return {
              Zone: dataA.NAME,
              cnt: dataData.BOOKING_TABLES.filter(
                (dataBT) => dataBT.TABLE.AREA.ID == dataA.ID
              ).length,
            };
          })
        ),
      });
    });

    area.map((dataA) =>
      passData.push({
        label: dataA.NAME,
        backgroundColor: randomColor(),

        data: [],

        barThickness: 8,
      })
    );
    passData.map((dataP) => filted.map(() => dataP.data.push(0)));

    filted.map((dataF, indexF) =>
      dataF.data.map((dataData, index) =>
        dataData.map((d, i) => {
          passData[i].data[indexF] = passData[i].data[indexF] + d.cnt;
        })
      )
    );

    filted.map((d) => {
      let dataA = new Date(d.Day);
      let A;
      A = new Date(dataA.setDate(dataA.getDate() + 1))
        .toISOString()
        .substring(0, 10);
      passDate.push(A);
    });

    setDateChart(passDate);
    setDataChart(passData);
  }

  const onSubmit = async (data) => {
    let endDate = new Date(datepickerInput);

    data.BookingStartDatetime = new Date(datepickerInput);
    data.BookingEndDatetime = new Date(
      endDate.setDate(endDate.getDate() + parseInt(data.endDate))
    );

    let JSONdata = JSON.stringify(data);

    const endpoint = '/api/booking/chart/getcountbyrid';

    const options = {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSONdata,
    };

    try {
      const response = await fetch(endpoint, options);

      const result = await response.json();

      setDataForChart(
        result.Booking,
        datepickerInput,
        parseInt(data.endDate),
        result.Area
      );
      setBookingCount(result.Card[0]?._count?.ID ?? '0');
      setTotalPrice(result.Card[0]?._sum?.TOTAL_PRICE ?? '0');
    } catch (error) {
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: 'Error',
        text: error,
        icon: 'error',
        confirmButtonText: 'close',
      });
    }
  };

  let element;

  if (session) {
    element = (
      <>
        <div className='flex flex-wrap mb-12 mt-12'>
          <div className='w-full px-4'>
            <CardStats
              statSubtitle='จำนวนผู้ใช้งานทั้งหมด'
              statTitle={props.countUser ?? '0'}
              statArrow=''
              statPercent=''
              statPercentColor='text-emerald-500'
              statDescripiron={``}
              statIconName='fas fa-users'
              statIconColor='bg-red-500'
            />
          </div>
        </div>
        <form
          id='restaurantForm'
          name='restaurantForm'
          onSubmit={handleSubmit(onSubmit)}
          className='px-4'
        >
          <div className='relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg'>
            <div className='flex-auto p-4'>
              <div className='flex flex-wrap'>
                <div className='relative w-full pr-4 max-w-full flex-grow flex-1'>
                  <div className='flex flex-col lg:flex-row justify-between'>
                    <div className='grid grid-cols-12 gap-2 flex-1 justify-start'>
                      <div className='col-span-12 lg:col-span-3 flex flex-col'>
                        <label>เลือกร้านอาหาร</label>
                        <select {...register('restaurantId')} className='h-10'>
                          {props.dropDownList.map((value, index) => {
                            return (
                              <option key={index} value={value.RESTAURANT.ID}>
                                {value.RESTAURANT.NAME}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className='col-span-12 lg:col-span-3 flex flex-col'>
                        <label>วันที่</label>
                        <Menu
                          menuButton={
                            <MenuButton>
                              <div className='shadow-md xl:mb-0 h-10 flex flex-row border-1 text-left'>
                                <i className='far fa-calendar mx-4 self-center'></i>
                                <div className='px-2 items-center self-center'>
                                  <p className='text-sm font-bold'>
                                    {datepickerInput.getDate().toString()}/
                                    {(
                                      datepickerInput.getMonth() + 1
                                    ).toString()}
                                    /{datepickerInput.getFullYear().toString()}
                                  </p>
                                </div>
                              </div>
                            </MenuButton>
                          }
                        >
                          <MenuItem
                            onClick={(e) => {
                              e.keepOpen = true;
                            }}
                          >
                            <div className=' z-2 bg-light shadow-md rounded-lg '>
                              <DatePicker
                                onChange={(date) => {
                                  setDatepickerInput(date);
                                }}
                                selected={datepickerInput}
                              />
                            </div>
                          </MenuItem>
                        </Menu>
                      </div>
                      <div className='col-span-12 lg:col-span-3 flex flex-col mx-0'>
                        <label>จากนี้อีก</label>
                        <select {...register('endDate')} className='h-10'>
                          <option value='1'> วันนี้</option>
                          <option value='7'> 7 วัน</option>
                          <option value='30'> 30 วัน</option>
                        </select>
                      </div>
                    </div>
                    <div className='mt-5'>
                      <button
                        className='w-full bg-blueGray-700 active:bg-blueGray-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150'
                        type='submit'
                      >
                        ค้นหา
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className='flex flex-wrap mb-12 mt-12'>
          <div className='w-full lg:w-6/12 xl:w-6/12 px-4'>
            <CardStats
              statSubtitle='จำนวนการจอง'
              statTitle={String(bookingCount) ?? '0'}
              statArrow=''
              statPercent=''
              statPercentColor='text-emerald-500'
              statDescripiron={`ช่วงระยะเวลา ${fDate} - ${lDate}`}
              statIconName='far fa-chart-bar'
              statIconColor='bg-red-500'
            />
          </div>
          <div className='w-full lg:w-6/12 xl:w-6/12 px-4'>
            <CardStats
              statSubtitle='ราคารวม'
              statTitle={String(totalPrice) ?? '0'}
              statArrow=''
              statPercent=''
              statPercentColor='text-red-500'
              statDescripiron={`ช่วงระยะเวลา ${fDate} - ${lDate}`}
              statIconName='fas fa-chart-pie'
              statIconColor='bg-orange-500'
            />
          </div>
          {/* <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CardStats
            statSubtitle="SALES"
            statTitle="924"
            statArrow="down"
            statPercent="1.10"
            statPercentColor="text-orange-500"
            statDescripiron="Since yesterday"
            statIconName="fas fa-users"
            statIconColor="bg-pink-500"
          />
        </div>
        <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CardStats
            statSubtitle="PERFORMANCE"
            statTitle="49,65%"
            statArrow="up"
            statPercent="12"
            statPercentColor="text-emerald-500"
            statDescripiron="Since last month"
            statIconName="fas fa-percent"
            statIconColor="bg-lightBlue-500"
          />
        </div> */}
        </div>
        <div className='flex flex-wrap'>
          {/* <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
          <CardLineChart />
        </div> */}

          <div className='w-full xl:w-12/12 px-4'>
            <CardBarChart passData={dataChart} passDate={dateChart} />
          </div>
        </div>
        <div className='flex flex-wrap mt-4'>
          {/* <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
          <CardPageVisits />
        </div>
        <div className="w-full xl:w-4/12 px-4">
          <CardSocialTraffic />
        </div> */}
        </div>
      </>
    );
  } else {
    element = <div></div>;
  }

  return element;
}
Dashboard.layout = BackOffice;

export default Dashboard;
