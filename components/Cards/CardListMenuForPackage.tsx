import { GetStaticProps } from "next";
import React, { useState } from "react";
import Modal from "react-modal";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

// components
export default function CardListMenuForPackage({ listMenu, listMenuChecked, bookingPackageId }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({

  });

  const [checkedIds, setChekedIds] = useState(
    listMenuChecked.map((data) => parseInt(data.MENU_ID))
  );


  listMenu = listMenu.map((data) => {
    data.select = false;
    return { ...data };
  });


  const handlechange = (e) => {
    const clickedId = +e.target.value;
    if (checkedIds.includes(clickedId)) {
      setChekedIds(checkedIds.filter((id) => id !== clickedId));
    } else {
      setChekedIds([...checkedIds, clickedId]);
    }
  };

  const isCheked = (id) => {


    return checkedIds.includes(id);
  };

  const onSubmit = async (data) => {
    const checkedUpdate = []

    data.data.map((data) => {
      data.bookingPackageId = bookingPackageId
      if (checkedIds.includes(parseInt(data.menuId))) {
        data.isActive = true
        data.qty = parseInt(data.qty)
        data.menuId = parseInt(data.menuId)
        checkedUpdate.push(data)

      }

      if (listMenuChecked.find((dataChecked) => dataChecked.MENU_ID == data.menuId && !checkedIds.includes(parseInt(data.menuId)))) {
        data.isActive = false
        data.qty = parseInt(data.qty)
        data.menuId = parseInt(data.menuId)
        checkedUpdate.push(data)


      }
    });

    const endpoint = `/api/booking_package_set/upsert`;

    let JSONdata = JSON.stringify(checkedUpdate);

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

      if (response.status == 200) {
        history.back()
      }
    } catch (error) {
      const MySwal = withReactContent(Swal)
      MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
    }


  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                <h3 className="font-semibold text-base text-blueGray-700">
                  ตารางเมนูในแพ็คเกจ
                </h3>
              </div>
              <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                <button
                  className="bg-blueGray-700 active:bg-blueGray-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                  type="submit"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
          <div className="block w-full overflow-x-auto">
            {/* Projects table */}
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    ชื่ออาหาร
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    คำอธิบาย
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    ราคา
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">

                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    จำนวน
                  </th>
                  <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody>
                {listMenu?.map((value, index) => {
                  const dataQty = listMenuChecked.find((data) => {
                    if (data.MENU_ID == value.ID) {
                      return data.QTY;
                    } else return 0;
                  });

                  return (
                    <tr key={value.ID}>
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
                        <input
                          type="hidden"
                          // value=
                          name={`data[${index}].menuId`}
                          defaultValue={value.ID ?? 0}
                          {...register(`data.${index}.menuId`)}
                        ></input>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <input
                          type="number"
                          min={1}
                          name={`data[${index}].qty`}
                          defaultValue={dataQty?.QTY ?? 1}
                          {...register(`data.${index}.qty`)}
                        ></input>
                      </td>

                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <div>
                          <input
                            id="default-checkbox"
                            // name={`data[${index}].checked`}
                            type="checkbox"
                            onChange={handlechange}
                            value={value.ID}
                            // defaultValue="false"
                            // {...register(`data[${index}].checked`)}
                            checked={isCheked(value.ID)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* {`${checkedIds}`} */}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </>
  );
}
