import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function upsertBookingById(req, res) {
  const data = req.body;

  const idAccountProfile = 1;
  const dataProfile = {
    profilePicPath: "none",
    firstNmae: "FN",
    middleName: "null",
    lastName: "LN",
    birthDate: new Date(),
    gender: "Male",
    phone: "000-0000-0000",
    createBy: 0,
    updateBy: 0,
  };
  const dataInternal = {
    emailValidationStatus: false,
    comfimationToken: "none",
    tokenGenerationTime: "none",
    tokenRecoveryTime: "none",
  };
  function hashPassword(data) {
    return data;
  }

  function profilePicPath(data) {
    return data;
  }

  const responseAccountProfile = await prisma.aCCOUNT_PROFILE.upsert({
    where: { ID: idAccountProfile ?? 0 },
    update: {
      ACCOUNT_TYPE_ID: data.accountTypeId ?? 1,
      PROFILE_PIC_PATH: profilePicPath(dataProfile.profilePicPath),
      FIRST_NAME: data.firstNmae ?? dataProfile.firstNmae,
      MIDDLE_NAME: data.middleName ?? dataProfile.middleName,
      LAST_NAME: data.lastName ?? dataProfile.lastName,
      BIRTH_DATE: data.birthDate ?? dataProfile.birthDate,
      GENDER: data.gender ?? dataProfile.gender,
      PHONE: data.phone ?? dataProfile.phone,
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
    create: {
      ACCOUNT_TYPE_ID: data.accountTypeId ?? 1,
      PROFILE_PIC_PATH: dataProfile.profilePicPath,
      FIRST_NAME: data.firstNmae ?? dataProfile.firstNmae,
      MIDDLE_NAME: data.middleName ?? dataProfile.middleName,
      LAST_NAME: data.lastName ?? dataProfile.lastName,
      BIRTH_DATE: data.birthDate ?? dataProfile.birthDate,
      GENDER: data.gender ?? dataProfile.gender,
      PHONE: data.phone ?? dataProfile.phone,
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
  });
  await prisma.$disconnect()
  const responseAccountInternal = await prisma.aCCOUNT_INTERNAL.upsert({
    where: { ACCOUNT_PROFILE_ID: responseAccountProfile.ID ?? 0 },
    update: {

      EMAIL: data.email,
      EMAIL_VALIDATION_STATUS:
        data.emailValidation ?? dataInternal.emailValidationStatus,
      USERNAME: data.username,
      PASSWORD_HASH: hashPassword(data.password),
      COMFIMATION_TOKEN: data.comfimationToken ?? dataInternal.comfimationToken,
      TOKEN_GENERATION_TIME:
        data.tokenGenerationTime ?? dataInternal.tokenGenerationTime,
      TOKEN_RECOVERY_TIME:
        data.tokenRecoveryTime ?? dataInternal.tokenRecoveryTime,
      IS_ACTIVE: data.IsActive ?? true,
    },
    create: {
      ACCOUNT_PROFILE_ID: responseAccountProfile.ID,
      EMAIL: data.email,
      EMAIL_VALIDATION_STATUS:
        data.emailValidation ?? dataInternal.emailValidationStatus,
      USERNAME: data.username,
      PASSWORD_HASH: hashPassword(data.password),
      COMFIMATION_TOKEN: data.comfimationToken ?? dataInternal.comfimationToken,
      TOKEN_GENERATION_TIME:
        data.tokenGenerationTime ?? dataInternal.tokenGenerationTime,
      TOKEN_RECOVERY_TIME:
        data.tokenRecoveryTime ?? dataInternal.tokenRecoveryTime,
      IS_ACTIVE: data.IsActive ?? true,
    },
  });

  await prisma.$disconnect()
  res.status(200).json({ data: "okay" });
}
// http://localhost:3000/api/account_internal/upsert
export default upsertBookingById;
