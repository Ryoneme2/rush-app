import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function CardEditMenu({ dataMenu, restaurantId, menuC }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    register("description", { value: dataMenu?.DESCRIPTION ?? "" })
  })

  const onSubmit = async (data) => {

    if (dataMenu?.ID) {
      data.id = dataMenu.ID;
      data.menuCategoriesId = dataMenu.MENU_CATEGORIES_ID;
      data.restaurantId = dataMenu.RESTAURANT_ID;

    } else {
      data.menuCategoriesId = data.MenuCategorieId;
      data.restaurantId = restaurantId;

    }

    let JSONdata = JSON.stringify([data]);

    const endpoint = `/api/menu/upsert`;

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
      // const result = await response.json();

      if (response.status == 200) {
        // withReactContent(Swal).fire({ title: "Success", text: "New menu have been added", icon: "success", cancelButtonText: "close" })
        history.back()
      }
    } catch (error) {
      const MySwal = withReactContent(Swal)
      MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
    }

    // if (response.status == 200) {
    //   // withReactContent(Swal).fire({ title: "Success", text: "New menu have been added", icon: "success", cancelButtonText: "close" })
    //   history.back()
    // }
    // else {
    //   withReactContent(Swal).fire({ title: "Error", text: "something wrong with adding new data", icon: "error", cancelButtonText: "close" })
    // }

  };
  return (
    <>
      <form
        id="restaurantForm"
        name="restaurantForm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
          <div className="rounded-t bg-white mb-0 px-6 py-6">
            <div className="text-center flex justify-between">
              <h6 className="text-blueGray-700 text-xl font-bold">
                {dataMenu == null ? "เพิ่มเมนูอาหาร" : "แก้ไขเมนูอาหาร"}
              </h6>
              <button
                className="bg-blueGray-700 active:bg-blueGray-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                type="submit"
              >
                บันทึก
              </button>
            </div>
          </div>
          <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
            {/* <form> */}
            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              ข้อมูลเกี่ยวกับเมนู
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    ชื่ออาหาร <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue={dataMenu?.NAME ?? ""}
                    placeholder="ชื่ออาหาร"
                    {...register("name")}
                    required
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    ราคา <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="workHoursDescription"
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue={dataMenu?.PRICE ?? ""}
                    placeholder="0.00"
                    {...register("price")}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="px-4">
              <label
                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                htmlFor="grid-password"
              >เลือกหมวดอาหาร</label>
              <select {...register("MenuCategorieId")}>
                {menuC.map((value, index) => {
                  return (<option key={index} value={value.ID} selected={dataMenu?.MENU_CATEGORIES_ID == value.ID ?? false} >{value.NAME}</option>
                  )
                })}

              </select>
            </div>
            <hr className="mt-6 border-b-1 border-blueGray-300" />

            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              คำอธิบายของเมนูอาหาร
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    คำอธิบาย
                  </label>
                  {/* <textarea
                    id="description"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    rows={4}
                    defaultValue={dataMenu?.DESCRIPTION ?? ""}
                    placeholder="รายละเอียดอาหาร"
                    {...register("description")}
                  ></textarea> */}
                  <ReactQuill
                    className="bg-white"
                    theme="snow"
                    placeholder="รายละเอียดอาหาร"
                    value={watch("description") ?? dataMenu?.DESCRIPTION} onChange={(e) => { setValue("description", e); }} />

                </div>
              </div>
            </div>
            {/* </form> */}
          </div>
        </div>
      </form>
    </>
  );
}
