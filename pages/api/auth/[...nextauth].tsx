import NextAuth from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";
import { compare, hash } from 'bcryptjs'

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Cerdentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {

        const accountInternal = await prisma.aCCOUNT_INTERNAL.findFirst({
          where: {
            EMAIL: credentials.email,
          },
        });
        await prisma.$disconnect()
        const accountProfile = await prisma.aCCOUNT_PROFILE.findFirst({
          where: { ID: accountInternal.ACCOUNT_PROFILE_ID },
        });

        await prisma.$disconnect()
        if (accountProfile && await compare(credentials.password, accountInternal.PASSWORD_HASH)) {

          return accountProfile;
          // return {id:accountProfile.ID ,name:accountInternal.USERNAME, email:accountInternal.EMAIL ,image: accountProfile.PROFILE_PIC_PATH,data:"asdsdadwa"};
        }
        //null
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    }),
  ],
  session: { maxAge: 24 * 60 * 60, },

  pages: {
    error: "/",
    signIn: "/"
  },
  callbacks: {

    async signIn({ user, account, profile, email, credentials }) {
      // Persist the OAuth access_token to the token right after signin
      if (account.provider === 'google') {

        const checkUserExTernal = await prisma.aCCOUNT_EXTERNAL.findFirst({
          where: { PROVIDER_ACCOUNT_ID: user.id }
        })
        const checkUserInternal = await prisma.aCCOUNT_INTERNAL.findFirst({
          where: { EMAIL: user.email }
        })
        const name = user.name.toString().split(' ')
        if (!checkUserExTernal && !checkUserInternal) {

          try {
            const memberType = await prisma.aCCOUNT_TYPE.findFirst({
              where: { NAME: process.env.TYPE_MEMBER_NAME }
            })
            const accountProfile = await prisma.aCCOUNT_PROFILE.create({
              data: {
                ACCOUNT_TYPE_ID: memberType.ID,
                PROFILE_PIC_PATH: "-",
                FIRST_NAME: name[0],
                MIDDLE_NAME: "-",
                LAST_NAME: name[1],
                BIRTH_DATE: new Date(),
                GENDER: "Male",
                PHONE: '-',
                IS_ACTIVE: true,
                MODIFY_DATETIME: new Date()
              }
            });
            await prisma.aCCOUNT_EXTERNAL.create({
              data: {
                ACCOUNT_PROFILE_ID: accountProfile.ID,
                ACCOUNT_EXTERNAL_PROVIDER_ID: parseInt(process.env.GOOGLE_PROVIDER_ID),
                PROVIDER_ACCOUNT_ID: user.id,
                PROVIDER_TOKEN: account.id_token,
                PROVIDER_TOKEN_TYPE: account.token_type,
                IS_ACTIVE: true,
                MODIFY_DATETIME: new Date()
              }
            })
            await prisma.aCCOUNT_INTERNAL.create({
              data: {
                ACCOUNT_PROFILE_ID: accountProfile.ID,
                EMAIL: user.email,
                EMAIL_VALIDATION_STATUS: false,
                USERNAME: user.email,
                PASSWORD_HASH: '-',
                COMFIMATION_TOKEN: "-",
                TOKEN_GENERATION_TIME: "-",
                TOKEN_RECOVERY_TIME: "-",
                IS_ACTIVE: true,
                MODIFY_DATETIME: new Date()
              }
            })
            user.ID = accountProfile.ID
            user.FIRST_NAME = name[0]
            user.LAST_NAME = name[1]

            return true
          } catch (e) {

            return false
          }
        } else if (checkUserExTernal) {
          user.ID = checkUserExTernal.ACCOUNT_PROFILE_ID
          user.FIRST_NAME = name[0]
          user.LAST_NAME = name[1]

          return true
        }

      } else if (account.provider == 'facebook') {
        const checkUserExTernal = await prisma.aCCOUNT_EXTERNAL.findFirst({
          where: { PROVIDER_ACCOUNT_ID: user.id }
        })
        const checkUserInternal = await prisma.aCCOUNT_INTERNAL.findFirst({
          where: { EMAIL: user.email }
        })
        const name = user.name.toString().split(' ')
        if (!checkUserExTernal && !checkUserInternal) {

          try {
            const memberType = await prisma.aCCOUNT_TYPE.findFirst({
              where: { NAME: process.env.TYPE_MEMBER_NAME }
            })
            const accountProfile = await prisma.aCCOUNT_PROFILE.create({
              data: {
                ACCOUNT_TYPE_ID: memberType.ID,
                PROFILE_PIC_PATH: "-",
                FIRST_NAME: name[0],
                MIDDLE_NAME: "-",
                LAST_NAME: name[1],
                BIRTH_DATE: new Date(),
                GENDER: "Male",
                PHONE: '-',
                IS_ACTIVE: true,
                MODIFY_DATETIME: new Date()
              }
            });
            await prisma.aCCOUNT_EXTERNAL.create({
              data: {
                ACCOUNT_PROFILE_ID: accountProfile.ID,
                ACCOUNT_EXTERNAL_PROVIDER_ID: parseInt(process.env.FACEBOOK_PROVIDER_ID),
                PROVIDER_ACCOUNT_ID: user.id,
                PROVIDER_TOKEN: account.access_token,
                PROVIDER_TOKEN_TYPE: account.token_type,
                IS_ACTIVE: true,
                MODIFY_DATETIME: new Date()
              }
            })
            await prisma.aCCOUNT_INTERNAL.create({
              data: {
                ACCOUNT_PROFILE_ID: accountProfile.ID,
                EMAIL: user.email,
                EMAIL_VALIDATION_STATUS: false,
                USERNAME: user.email,
                PASSWORD_HASH: '-',
                COMFIMATION_TOKEN: "-",
                TOKEN_GENERATION_TIME: "-",
                TOKEN_RECOVERY_TIME: "-",
                IS_ACTIVE: true,
                MODIFY_DATETIME: new Date()
              }
            })
            user.ID = accountProfile.ID
            user.FIRST_NAME = name[0]
            user.LAST_NAME = name[1]


            return true
          } catch (e) {

            return false
          }
        } else if (checkUserExTernal) {
          user.ID = checkUserExTernal.ACCOUNT_PROFILE_ID
          user.FIRST_NAME = name[0]
          user.LAST_NAME = name[1]

          return true
        }
      } else if (account.provider == 'credentials') {
        return true
      }
      //false
      return true
    },
    async jwt({ token, user, account }) {



      if (account) {
        // token.accessToken = account.access_token;
        token.user = jwt.sign(user, process.env.JWT_SECRET);
        token.fname = user.FIRST_NAME;
        token.lname = user.LAST_NAME;

      }

      return Promise.resolve(token);
    },
    async session({ session, token, user }) {


      // Send properties to the client, like an access_token from a provider.
      session.tokenUser = token.user;
      session.fname = token.fname;
      session.lname = token.lname;

      prisma.$disconnect()
      return session;
    },
  },
  secret: process.env.JWT_SECRET,
  jwt: { secret: process.env.JWT_SECRET },
});
