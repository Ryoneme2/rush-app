import { GetStaticProps } from "next";
import React from "react";
import Modal from "react-modal"
import { useRouter } from "next/router";
import Link from "next/link";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";


// components

export default function CardListRestaurantGallery({ list, restaurantId }) {
  const router = useRouter();
  const onDelete = async (data) => {
    data.IS_ACTIVE = false

    let JSONdata = JSON.stringify({
      id: data.ID,
      restaurantId: data.RESTAURANT_ID,
      filePath: data.FILE_PATH,
      isActive: false
    });
    const endpoint = `/api/restaurant_gallery/delete`;

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
      const result = await response.json();

      router.replace(router.asPath);
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
                ตารางรูปภาพตัวอย่างร้านอาหาร
              </h3>
            </div>
            <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
              <Link href={`edit/${restaurantId}/0`}>
                <a>
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    เพิ่มรูปภาพร้านอาหาร
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
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  ภาพตัวอย่าง
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  เมนูจัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((value, index) => {
                return (
                  <tr key={index} className="border-b">
                    <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      <img src={value.FILE_PATH} alt="" className="max-h-96" />
                    </th>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <Link href={`edit/${restaurantId}/${value.ID}`}>
                        <a>
                          <button
                            className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                            type="button"
                            data-modal-toggle="defaultModal"
                          >
                            แก้ไข
                          </button>
                        </a>
                      </Link>
                      {/* <Link href={`edit/${restaurantId}/${value.ID}`}>
                        <a> */}
                      <button
                        className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        data-modal-toggle="defaultModal"
                        onClick={() => { onDelete(value) }}
                      >
                        ลบ
                      </button>
                      {/* </a>
                      </Link> */}
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
