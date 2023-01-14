import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";


export default function CardEditRegisterRoleManagement(props) {
  const MySwal = withReactContent(Swal)
  const [filter, setFilter] = useState('');
  const [registeredEmail, setRegisteredEmail] = React.useState("");
  const [createAccountEmailModalOpen, setCreateAccountEmailModalOpen] = useState(false)
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

  function GetDate() {
    let items = []

    for (var i = 1; i <= 31; i++) {
      items.push(<option value={i}>{i}</option>)
    }
    return items
  }

  function GetMonths() {
    let items = []
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    for (var i = 0; i < months.length; i++) {
      items.push(<option value={months[i]}>{months[i]}</option>)
    }
    return (items)
  }

  function GetYear() {
    let items = []

    const currentDate = new Date().getFullYear() - 20;

    for (var i = 1950; i <= currentDate; i++) {
      items.push(<option value={i}>{i}</option>)
    }
    return (items)
  }

  async function registerEmail(data) {
    let date = new Date(data.date + data.month + data.year)

    setRegisteredEmail(data.email)

    // const res = await fetch(`/api/account_profile/createowner`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     email: data.email,
    //     password: data.password,
    //     firstName: data.firstname,
    //     lastName: data.lastname,
    //     birthDate: date,
    //     phone: data.phone
    //   }),
    // })
    const MySwal = withReactContent(Swal)
    let res
    try {

      res = await fetch(`/api/account_profile/createowner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstname,
          lastName: data.lastname,
          birthDate: date,
          phone: data.phone
        }),
      })


      if (res.status == 400) {
        MySwal.fire({ title: "Already used emai", text: "Error code 400", icon: "error", confirmButtonText: "close" })
      }

      if (res.status == 200) {
        history.back()
      }

    } catch (error) {
      MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
    }



    // if (res.status == 200) {
    //   setCreateAccountEmailModalOpen(false)
    //   MySwal.fire({
    //     title: "Register complete",
    //     text: "your registration has been completed.",
    //     icon: "success",
    //     confirmButtonText: "ok",
    //   })
    //   history.back();
    // }

    // if (res.status == 400) {
    //   MySwal.fire({
    //     title: "Used Email",
    //     text: "this email is already used",
    //     icon: "error",
    //     confirmButtonText: "ok",
    //   })
    // }



    // setCreateAccountEmailModalOpen(false)

    // http://localhost:3000/api/action/register/create
  }

  return (
    <>

      <form action="" onSubmit={handleSubmit(registerEmail)} className="flex flex-row justify-center">
        <div className="relative flex flex-col min-w-0 break-words w-12/12 mb-6 shadow-lg rounded-lg bg-white border-0 px-5 py-3">
          <h1 className="mx-auto text-xl font-bold">เพิ่มแอดมินใหม่</h1>
          <div className="my-5">
            <label htmlFor="">Email<span className="text-red-600">*</span> </label>
            <input type="email" name="email" className="w-full rounded-lg" {...register("email")} required />
          </div>

          <div className="my-5">
            <label htmlFor="">Password<span className="text-red-600">*</span> </label>
            <input type="password" name="password" minLength={4} className="w-full rounded-lg" {...register("password")} required />
          </div>

          <div className="flex flex-row w-full space-x-3">
            <div className="my-5 flex-1">
              <label htmlFor="">First name<span className="text-red-600">*</span> </label>
              <input type="text" name="firstname" className="w-full rounded-lg" {...register("firstname")} required />
            </div>

            <div className="my-5 flex-1">
              <label htmlFor="">Last name<span className="text-red-600">*</span> </label>
              <input type="text" name="lastname" className="w-full rounded-lg" {...register("lastname")} required />
            </div>
          </div>

          <div className="my-5 flex flex-col">
            <label htmlFor="">Date of birth<span className="text-red-600">*</span> </label>
            <div className="flex flex-row w-full">
              <select name="" id="" className="flex-1 mx-1 rounded-md" {...register("date")} required>{GetDate()}</select>
              <select name="" id="" className="flex-1 mx-1 rounded-md" {...register("month")} required>{GetMonths()}</select>
              <select name="" id="" className="flex-1 mx-1 rounded-md" {...register("year")} required>{GetYear()}</select>
            </div>
          </div>

          <div className="my-5">
            <label htmlFor="">Phone number<span className="text-red-600">*</span> </label>
            <input type="tel" name="Phone" minLength={10} maxLength={10} className="w-full rounded-lg" {...register("phone")} required />
          </div>

          <button type="submit" className="bg-primary text-white rounded-md w-full h-10 mb-5">Create new admin account</button>
        </div>

      </form>
    </>
  );
}
