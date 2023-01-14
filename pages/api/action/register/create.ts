import { PrismaClient } from "@prisma/client";
import { hash } from 'bcryptjs'
const prisma = new PrismaClient();

export async function createRegister(req, res) {
    const data = req.body;
    const checkEmail = await prisma.aCCOUNT_INTERNAL.findMany({
        where: { EMAIL: data.email }
    })
    await prisma.$disconnect()
    const memberType = await prisma.aCCOUNT_TYPE.findFirst({
        where: { NAME: process.env.TYPE_MEMBER_NAME }
    })
    await prisma.$disconnect()

    if (checkEmail.length == 0) {
        const accountProfile = await prisma.aCCOUNT_PROFILE.create({
            data: {
                ACCOUNT_TYPE_ID: memberType.ID,
                PROFILE_PIC_PATH: "-",
                FIRST_NAME: data.firstName,
                MIDDLE_NAME: "-",
                LAST_NAME: data.lastName,
                BIRTH_DATE: new Date(data.birthDate),
                GENDER: data.gender ?? "Male",
                PHONE: data.phone,
                IS_ACTIVE: data.isActive ?? true,
                MODIFY_DATETIME: new Date()
            }
        });

        const accountInternal = await prisma.aCCOUNT_INTERNAL.create({
            data: {
                ACCOUNT_PROFILE_ID: accountProfile.ID,
                EMAIL: data.email,
                EMAIL_VALIDATION_STATUS: false,
                USERNAME: data.email,
                PASSWORD_HASH: await hash(data.password, parseInt(process.env.HASH_SALT)),
                COMFIMATION_TOKEN: "-",
                TOKEN_GENERATION_TIME: "-",
                TOKEN_RECOVERY_TIME: "-",
                IS_ACTIVE: data.isActive ?? true,
                MODIFY_DATETIME: new Date()
            }
        })

        await prisma.$disconnect()
        if (accountProfile) {
            res.status(200).json(accountProfile);
        } else res.status(400).json({});
    } else {
        res.status(400).json({ msg: 'email have use' })
    }
}
// http://localhost:3000/api/action/register/create

export default createRegister;
