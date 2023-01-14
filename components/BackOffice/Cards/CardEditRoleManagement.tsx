import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";


export default function CardEditRoleManagement(props) {
  const MySwal = withReactContent(Swal)
  const [filter, setFilter] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();


  const [checkedIds, setChekedIds] = useState(props.Data?.IS_ACTIVE ?? true);



  const handlechange = (e) => {

    if (checkedIds) {

      setChekedIds(false);
    } else {
      setChekedIds(true);
    }
  };

  const isCheked = () => {

    return checkedIds;
  };

  const onSubmit = async (data) => {


    let JSONdata = JSON.stringify(data);

    const endpoint = `/api/account_profile/updaterole`;

    const options = {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSONdata,
    };

    let response
    const MySwal = withReactContent(Swal)
    try {

      response = await fetch(endpoint, options);
      const result = await response.json();

      if (response.status == 200) {
        MySwal.fire({
          title: "Success", text: "New admin have been change.", icon: "success", cancelButtonText: "close",
        })

        history.back();
      }

      if (response.status == 400) {
        MySwal.fire({ title: "Error", text: "Already used email, Error 400", icon: "error", cancelButtonText: "close", })
      }

    } catch (error) {
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
                การจัดการข้อมูลบุคลากร
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
              ข้อมูลเกี่ยวกับบุคลากร
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4">
                {
                  props.Data.account ? <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      อีเมลผู้ใช้งาน
                    </label>
                    <input
                      type="hidden"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      defaultValue={props.Data?.account?.ACCOUNT_INTERNAL[0]?.EMAIL ?? ""}
                      {...register("email")}
                    />
                    <input
                      type="text" disabled={props.Data?.account?.ACCOUNT_INTERNAL[0]?.EMAIL ? true : false}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      defaultValue={props.Data?.account?.ACCOUNT_INTERNAL[0]?.EMAIL ?? ""}
                    />
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      ชื่อผู้ใช้งาน
                    </label>
                    <input
                      type="text" disabled
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      defaultValue={props.Data?.account?.FIRST_NAME ?? ""}
                      {...register("fname")}
                    />
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      นามสกุลผู้ใช้งาน
                    </label>
                    <input
                      type="text" disabled
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      defaultValue={props.Data?.account?.LAST_NAME ?? ""}
                      {...register("lname")}
                    />
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">เลือกประเภทผู้ใช้งาน</label>
                    <select {...register("accountTypeId")} defaultValue={props.Data?.account?.ACCOUNT_TYPE_ID}>
                      {props.Data?.dropdown?.map((value, index) => {
                        return (
                          <option key={index} value={value.ID} >
                            {value.NAME}
                          </option>
                        );
                      })}
                    </select>

                  </div>

                    :

                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        อีเมลผู้ใช้งาน
                      </label>

                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        defaultValue={props.Data?.account?.ACCOUNT_INTERNAL[0]?.EMAIL ?? ""}
                        {...register("email")}
                      />
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        ชื่อผู้ใช้งาน
                      </label>
                      <input
                        type="text" disabled
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        defaultValue={props.Data?.account?.FIRST_NAME ?? ""}
                        {...register("fname")}
                      />
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        นามสกุลผู้ใช้งาน
                      </label>
                      <input
                        type="text" disabled
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        defaultValue={props.Data?.account?.LAST_NAME ?? ""}
                        {...register("lname")}
                      />
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">เลือกประเภทผู้ใช้งาน</label>

                      <select {...register("accountTypeId")} >
                        {props.Data?.dropdown?.map((value, index) => {
                          return (
                            <option key={index} value={value.ID} selected={props.Data?.account?.ACCOUNT_TYPE_ID == value.ID ?? false}>
                              {value.NAME}
                            </option>
                          );
                        })}
                      </select>

                    </div>

                }



              </div>
            </div>

            {/* </form> */}
          </div>
        </div>
      </form >
    </>
  );
}
