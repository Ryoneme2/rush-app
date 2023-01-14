import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

export default function CardEditStore({ restaurantData, restaurantCategory }) {

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const { data: session } = useSession();

  useEffect(() => {
    register("description", { required: true, value: restaurantData?.DESCRIPTION ?? "" })
  })

  useEffect(() => {
    register("condition", { required: true, value: restaurantData?.CONDITION ?? "" })
  })

  const [checkedPolicy, setCheckedPolicy] = useState(restaurantData?.IS_CANCLE_POLICY ?? true);

  const handlechange = (e) => {
    if (checkedPolicy) {
      setCheckedPolicy(false);
    } else {
      setCheckedPolicy(true);
    }
  };

  const isCheked = () => {
    return checkedPolicy;
  };

  // const [image, setImage] = useState(null);
  // const [createObjectURL, setCreateObjectURL] = useState([]);

  const onSubmit = async (data) => {

    // data.restaurantCatagoriesId = 1;

    if (restaurantData?.ID) {
      data.id = restaurantData.ID;
      // data.restaurantCatagoriesId = restaurantData.
    }

    if (data.lat == "") {
      data.lat = "-"
    }

    if (data.long == "") {
      data.long = "-"
    }

    data.isCanclePolicy = checkedPolicy

    let JSONdata = JSON.stringify([data]);

    const endpoint = "/api/restaurant_members/upsert";

    const options = {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + session?.tokenUser,
      },

      body: JSONdata,
    };

    let response
    try {
      response = await fetch(endpoint, options);
      history.back();
    } catch (error) {
      const MySwal = withReactContent(Swal)
      MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
    }

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
                {restaurantData == null ? "เพิ่มร้านใหม่" : "แก้ไขข้อมูลร้านของคุณ"}
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
              ข้อมูลของร้าน
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    ชื่อร้านอาหาร <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue={restaurantData?.NAME ?? ""}
                    placeholder="ชื่อร้านอาหาร"
                    required
                    {...register("name")}
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    ช่วงเวลาเปิดร้าน-ปิดร้าน <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="workHoursDescription"
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue={
                      restaurantData?.WORK_HOURS_DESCRIPTION ?? ""
                    }
                    placeholder="18:00 P.M. - 20:00 P.M."
                    required
                    {...register("workHoursDescription")}
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    ละติจูด
                  </label>
                  <input
                    id="lat"
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue={restaurantData?.LAT ?? ""}
                    placeholder="กรอกละติจูด"
                    {...register("lat")}
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    ลองจิจูด
                  </label>
                  <input
                    id="long"
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue={restaurantData?.LONG ?? ""}
                    placeholder="กรอกลองติจูด"
                    {...register("long")}
                  />


                </div>

              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mt-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    รายละเอียดที่ตั้งร้าน <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="lat"
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue={restaurantData?.ADDRESS ?? ""}
                    placeholder="ที่ตั้งร้าน"
                    required
                    {...register("address")}
                  />
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mt-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    Service Fee (%) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="lat"
                    type="number"
                    min="0"
                    max="100.0"
                    step=".1"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue={restaurantData?.FEE ?? ""}
                    placeholder="%"
                    required
                    {...register("fee")}
                  />
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mt-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    ตั้งค่า Policy
                  </label>
                  <input
                    type="checkbox"
                    onChange={handlechange}
                    checked={isCheked()}
                    className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label>เปิด - ปิด Policy</label>
                </div>
              </div>

              <input type="text" className="hidden" value={1} {...register("restaurantCatagoriesId")} />
              {/* <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mt-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    ประเภทร้าน <span className="text-red-600">*</span>
                  </label>
                  <select {...register("restaurantCatagoriesId")}>
                    {restaurantCategory.map((value, index) => {
                      return (
                        <option key={index} value={value.ID}>
                          {value.NAME}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div> */}
            </div>
            <hr className="mt-6 border-b-1 border-blueGray-300" />

            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              คำอธิบายเกี่ยวกับร้าน
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    คำอธิบาย <span className="text-red-600">*</span>
                  </label>
                  {/* <textarea
                    id="description"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    rows={4}
                    defaultValue={
                      restaurantData?.DESCRIPTION ?? ""
                    }
                    placeholder="รายละเอียดร้านอาหาร"
                    {...register("description")}
                  ></textarea> */}

                  <ReactQuill
                    className={errors.description ? "bg-white border-red-600 border" : "bg-white"}
                    theme="snow"
                    placeholder="รายละเอียดร้านอาหาร"
                    value={watch("description") ?? restaurantData?.DESCRIPTION} onChange={(e) => { setValue("description", e) }} />
                </div>
              </div>
            </div>

            <hr className="mt-6 border-b-1 border-blueGray-300" />

            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              เงื่อนไขและข้อตกลงของร้าน
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    เงื่อนไขและข้อตกลง <span className="text-red-600">*</span>
                  </label>
                  {/* <textarea
                    id="description"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    rows={4}
                    defaultValue={
                      restaurantData?.DESCRIPTION ?? ""
                    }
                    placeholder="รายละเอียดร้านอาหาร"
                    {...register("description")}
                  ></textarea> */}

                  <ReactQuill
                    className={errors.condition ? "bg-white border-red-600 border" : "bg-white"}
                    theme="snow"
                    placeholder="รายละเอียดร้านอาหาร"
                    value={watch("condition") ?? restaurantData?.CONDITION} onChange={(e) => { setValue("condition", e) }} />
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
