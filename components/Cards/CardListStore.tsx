import React from "react";
import Modal from "react-modal";
import { useRouter } from "next/router";
import Link from "next/link";
import { Menu, MenuItem, MenuButton, } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/core.css';
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";



// components

export default function CardListStore({ list }) {
  const router = useRouter()
  const removeRestaurant = async (data) => {
    const dummy = {
      id: data.RESTAURANT
        .ID,
      restaurantCatagoriesId: parseInt(data.RESTAURANT
        .RESTAURANT_CATEGORIES_ID),
      name: data.RESTAURANT
        .NAME.toString(),
      description: data.RESTAURANT
        .DESCRIPTION.toString(),
      lat: data.RESTAURANT
        .LAT.toString(),
      long: data.RESTAURANT
        .LONG.toString(),
      workHoursDescription: data.RESTAURANT
        .WORK_HOURS_DESCRIPTION.toString(),
      address: data.RESTAURANT
        .ADDRESS.toString(),
      isActive: false
    }

    let JSONdata = JSON.stringify([dummy]);

    const endpoint = "/api/restaurant/upsert";

    const options = {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSONdata,
    };

    let response
    try {
      response = await fetch(endpoint, options);
      router.reload()
    } catch (error) {
      const MySwal = withReactContent(Swal)
      MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
    }

  }

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-base text-blueGray-700">
                ตารางร้านค้าทั้งหมดของคุณ
              </h3>
            </div>
            <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
              <Link href={`restaurant/0`}>
                <a>
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    เพิ่มร้านค้า
                  </button>
                </a>
              </Link>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {/* Projects table */}
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-center">
                  ชื่อร้านอาหาร
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-center">
                  คำอธิบาย
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-center">
                  เวลาเปิด-ปิด
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-center">
                  เมนูจัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((value, index) => {
                return (
                  <tr key={index} className="border-b">
                    <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      {value.RESTAURANT.NAME}
                    </th>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">

                      <div className="max-h-48 max-w-2xl overflow-y-auto" dangerouslySetInnerHTML={{ __html: value.RESTAURANT.DESCRIPTION }}></div>

                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {value.RESTAURANT.WORK_HOURS_DESCRIPTION}
                    </td>

                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <Menu menuButton={
                        <MenuButton>
                          <div className="mx-2 flex flex-row items-center h-full">
                            <div className="mx-auto text-lg">
                              <i className="fas fa-ellipsis-v mx-1"></i>
                            </div>
                          </div>
                        </MenuButton>}
                        position="anchor"
                        direction="bottom"
                        viewScroll='auto'
                        portal={true}
                        offsetX={-40} offsetY={10}
                      >

                        <MenuItem className="hover:opacity-70" onClick={() => { }} href={`restaurant/${value.RESTAURANT.ID}`}>
                          <p className="p-2 pr-20">แก้ไข</p>
                        </MenuItem>
                        <MenuItem className="hover:opacity-70" onClick={() => removeRestaurant(value)}>
                          <p className="p-2 pr-20">ลบร้าน</p>
                        </MenuItem>
                        <MenuItem className="hover:opacity-70" onClick={() => { }} href={`music_category/${value.RESTAURANT.ID} `}>
                          <p className="p-2">แนวเพลง</p>
                        </MenuItem>
                        <MenuItem className="hover:opacity-70" onClick={() => { }} href={`restaurant_gallery/${value.RESTAURANT.ID}`}>
                          <p className="p-2">รูปภาพร้าน</p>
                        </MenuItem>
                        <MenuItem className="hover:opacity-70" onClick={() => { }} href={`restaurant_plan/${value.RESTAURANT.ID}`}>
                          <p className="p-2">รูปภาพผังร้าน</p>
                        </MenuItem>
                        <MenuItem className="hover:opacity-70" onClick={() => { }} href={`package/${value.RESTAURANT.ID}`}>
                          <p className="p-2">แพ็คเกจ</p>
                        </MenuItem>
                        {/* <MenuItem className="hover:opacity-70" onClick={() => { }} href={`menu/${value.RESTAURANT.ID}`}>
                          <p className="p-2">เมนู</p>
                        </MenuItem> */}
                        <MenuItem className="hover:opacity-70" onClick={() => { }} href={`area/${value.RESTAURANT.ID}`}>
                          <p className="p-2">พื้นที่</p>
                        </MenuItem>
                        <MenuItem className="hover:opacity-70" onClick={() => { }} href={`restarant_contact/${value.RESTAURANT.ID}`}>
                          <p className="p-2">ช่องทางติดต่อ</p>
                        </MenuItem>
                        <MenuItem className="hover:opacity-70" onClick={() => { }} href={`approve_booking/${value.RESTAURANT.ID}`}>
                          <p className="p-2">ยืนยันการจอง</p>
                        </MenuItem>
                      </Menu>

                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
