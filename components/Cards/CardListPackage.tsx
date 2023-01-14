import { GetStaticProps } from "next";
import React from "react";
import Modal from "react-modal"
import { useRouter } from "next/router";
import Link from "next/link";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

// components

export default function CardListPackage({ list, restaurantId }) {
  const router = useRouter()
  const removePackage = async (data) => {

    const dummy = {
      id: data.ID,
      restaurantId: parseInt(data.RESTAURANT_ID),
      name: data.NAME.toString(),
      description: data.DESCRIPTION.toString(),
      price: data.PRICE,
      isActive: false
    }

    let JSONdata = JSON.stringify([dummy]);

    const endpoint = "/api/booking_package/upsert";

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
                ตารางแพ็คเกจ
              </h3>
            </div>
            <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
              <Link href={`edit/0/${restaurantId}`}>
                <a>
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    เพิ่มแพ็คเกจ
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
                  ชื่อแพ็คเกจ
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  คำอธิบาย
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  ราคา
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  สถานะ
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
                      {value.NAME}
                    </th>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="max-h-48 overflow-y-auto" dangerouslySetInnerHTML={{ __html: value.DESCRIPTION }}></div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {value.PRICE}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {value.IS_ACTIVE.toString()}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <Link href={`edit/${value.ID}/${restaurantId}`}>
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
                      {/* <Link href={`editmenu/${restaurantId}/${value.ID}`}>
                        <a>
                          <button
                            className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                            type="button"
                            data-modal-toggle="defaultModal"
                          >

                            แก้ไขเมนู
                          </button>
                        </a>
                      </Link> */}

                      <button
                        className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        data-modal-toggle="defaultModal"
                        onClick={() => removePackage(value)}
                      >

                        ลบ
                      </button>
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
