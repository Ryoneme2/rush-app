import React, { Fragment, useRef } from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
export default function CardEditRestaurantGallery({ dataMenu, restaurantId, menuC }) {

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const mySwal = withReactContent(Swal);
  const [loadingModal, setLoadingModal] = useState(false);


  const [file, setFile] = useState(dataMenu?.FILE_PATH);
  const [createObjectURL, setCreateObjectURL] = useState([]);

  function Change(event) {


    const fileDate = event.target.files[0]

    setCreateObjectURL([URL.createObjectURL(fileDate)])
    setFile(event.target.files[0]);


  }
  const onSubmit = async (data) => {
    if (file == undefined) {
      history.back()
      return;
    }
    if (typeof file == 'string') {
      history.back()
      return;
    }


    setLoadingModal(true)

    const formData = new FormData();
    formData.append("image", file);
    formData.append("restaurantId", restaurantId);
    formData.append("id", data.id);


    // let JSONdata = JSON.stringify(data);

    const endpoint = `/api/restaurant_gallery/upsert`;

    const options = {
      method: "POST",

      headers: {
      },

      body: formData,
    };

    let response
    const MySwal = withReactContent(Swal)
    try {
      response = await fetch(endpoint, options);
      if (response.status == 200) {
        setLoadingModal(false)
        history.back()
        return;
      }

      if (response.status == 400) {
        setLoadingModal(false)
        MySwal.fire({ title: "Error", text: "An error in uploading progress, Error 400", icon: "error", confirmButtonText: "close" })
        return;
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
        <input
          id="workHoursDescription"
          type="text"
          className="hidden"
          defaultValue={dataMenu?.ID ?? 0}
          {...register("id")}
        />
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
          <div className="rounded-t bg-white mb-0 px-6 py-6">
            <div className="text-center flex justify-between">
              <h6 className="text-blueGray-700 text-xl font-bold">
                {dataMenu == null ? "เพิ่มรูปภาพตัวอย่างร้าน" : "แก้ไขรูปภาพตัวอย่างร้าน"}
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
              รูปภาพที่ต้องการ
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4 mb-8 lg:mb-0">
                <img src={createObjectURL[0] ? createObjectURL[0] : !createObjectURL[0] ? dataMenu?.FILE_PATH : ''} alt="" className="max-h-96" />
                {/* createObjectURL[0] */}
              </div>
              <input
                id="workHoursDescription"
                type="file"
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                onChange={(e) => {
                  Change(e);
                }}
              // {...register("file")}
              />
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    เลือกรูปภาพ
                  </label>

                </div>
              </div>
            </div>
            {/* </form> */}
          </div>
        </div>
      </form>
      {/* <img src={createObjectURL[0]} /> */}

      <Transition.Root show={loadingModal} as={Fragment}>
        <Dialog as="div" static className="relative z-10" onClose={() => { }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative bg-white rounded-md text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full p-5">
                  <div className="flex flex-col justify-center items-center h-56">
                    <i className="fas fa-circle-notch text-8xl mb-8 animate-spin"></i>
                    <p className="text-3xl">Loading</p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

    </>
  );
}
