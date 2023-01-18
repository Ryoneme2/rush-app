import NextAuth, { NextAuthOptions, User, Awaitable } from 'next-auth';
import AppleProvider from 'next-auth/providers/apple';
import FacebookProvider from 'next-auth/providers/facebook';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import { PrismaClient } from '@prisma/client';
import { JWT } from 'next-auth/jwt';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  secret: process.env.JWT_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.aCCOUNT_INTERNAL.findFirst({
          where: { EMAIL: credentials.email },
          include: { ACCOUNT_PROFILE: true },
        });
        if (!user) {
          return null;
        }
        const isValid = await compare(credentials.password, user.PASSWORD_HASH);
        const users = {
          id: user.ACCOUNT_PROFILE.ID,
          name: user.ACCOUNT_PROFILE.FIRST_NAME,
          email: user.EMAIL,
        };

        if (!isValid) return null;
        return users as unknown as Awaitable<User | null>;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  session: { maxAge: 24 * 60 * 60 },

  pages: {
    error: '/',
    signIn: '/',
  },
  // adapter: PrismaAdapter(prisma),
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Persist the OAuth access_token to the token right after signin
      if (account.provider === 'google') {
        const checkUserExTernal = await prisma.aCCOUNT_EXTERNAL.findFirst({
          where: { PROVIDER_ACCOUNT_ID: user.id },
        });
        const checkUserInternal = await prisma.aCCOUNT_INTERNAL.findFirst({
          where: { EMAIL: user.email },
        });
        const name = user.name.toString().split(' ');
        if (!checkUserExTernal && !checkUserInternal) {
          try {
            const memberType = await prisma.aCCOUNT_TYPE.findFirst({
              where: { NAME: process.env.TYPE_MEMBER_NAME },
            });
            const accountProfile = await prisma.aCCOUNT_PROFILE.create({
              data: {
                ACCOUNT_TYPE_ID: memberType.ID,
                PROFILE_PIC_PATH: '-',
                FIRST_NAME: name[0],
                MIDDLE_NAME: '-',
                LAST_NAME: name[1],
                BIRTH_DATE: new Date(),
                GENDER: 'Male',
                PHONE: '-',
                IS_ACTIVE: true,
                MODIFY_DATETIME: new Date(),
              },
            });
            await prisma.aCCOUNT_EXTERNAL.create({
              data: {
                ACCOUNT_PROFILE_ID: accountProfile.ID,
                ACCOUNT_EXTERNAL_PROVIDER_ID: parseInt(
                  process.env.GOOGLE_PROVIDER_ID
                ),
                PROVIDER_ACCOUNT_ID: user.id,
                PROVIDER_TOKEN: account.id_token,
                PROVIDER_TOKEN_TYPE: account.token_type,
                IS_ACTIVE: true,
                MODIFY_DATETIME: new Date(),
              },
            });
            await prisma.aCCOUNT_INTERNAL.create({
              data: {
                ACCOUNT_PROFILE_ID: accountProfile.ID,
                EMAIL: user.email,
                EMAIL_VALIDATION_STATUS: false,
                USERNAME: user.email,
                PASSWORD_HASH: '-',
                COMFIMATION_TOKEN: '-',
                TOKEN_GENERATION_TIME: '-',
                TOKEN_RECOVERY_TIME: '-',
                IS_ACTIVE: true,
                MODIFY_DATETIME: new Date(),
              },
            });
            user.id = accountProfile.ID + '';
            return true;
          } catch (e) {
            return false;
          }
        } else if (checkUserExTernal) {
          user.id = checkUserExTernal.ACCOUNT_PROFILE_ID + '';

          return true;
        }
      } else if (account.provider == 'facebook') {
        const checkUserExTernal = await prisma.aCCOUNT_EXTERNAL.findFirst({
          where: { PROVIDER_ACCOUNT_ID: user.id },
        });
        const checkUserInternal = await prisma.aCCOUNT_INTERNAL.findFirst({
          where: { EMAIL: user.email },
        });
        const name = user.name.toString().split(' ');
        if (!checkUserExTernal && !checkUserInternal) {
          try {
            const memberType = await prisma.aCCOUNT_TYPE.findFirst({
              where: { NAME: process.env.TYPE_MEMBER_NAME },
            });

            const accountProfile = await prisma.aCCOUNT_PROFILE.create({
              data: {
                ACCOUNT_TYPE_ID: memberType.ID,
                PROFILE_PIC_PATH: '-',
                FIRST_NAME: name[0],
                MIDDLE_NAME: '-',
                LAST_NAME: name[1],
                BIRTH_DATE: new Date(),
                GENDER: 'Male',
                PHONE: '-',
                IS_ACTIVE: true,
                MODIFY_DATETIME: new Date(),
              },
            });
            await prisma.aCCOUNT_EXTERNAL.create({
              data: {
                ACCOUNT_PROFILE_ID: accountProfile.ID,
                ACCOUNT_EXTERNAL_PROVIDER_ID: parseInt(
                  process.env.FACEBOOK_PROVIDER_ID
                ),
                PROVIDER_ACCOUNT_ID: user.id,
                PROVIDER_TOKEN: account.access_token,
                PROVIDER_TOKEN_TYPE: account.token_type,
                IS_ACTIVE: true,
                MODIFY_DATETIME: new Date(),
              },
            });
            await prisma.aCCOUNT_INTERNAL.create({
              data: {
                ACCOUNT_PROFILE_ID: accountProfile.ID,
                EMAIL: user.email,
                EMAIL_VALIDATION_STATUS: false,
                USERNAME: user.email,
                PASSWORD_HASH: '-',
                COMFIMATION_TOKEN: '-',
                TOKEN_GENERATION_TIME: '-',
                TOKEN_RECOVERY_TIME: '-',
                IS_ACTIVE: true,
                MODIFY_DATETIME: new Date(),
              },
            });
            user.id = accountProfile.ID + '';

            return true;
          } catch (e) {
            return false;
          }
        } else if (checkUserExTernal) {
          user.id = checkUserExTernal.ACCOUNT_PROFILE_ID + '';

          return true;
        }
      } else if (account.provider == 'credentials') {
        return true;
      }
      //false
      return true;
    },
    async jwt({ token, user, account }) {
      if (account) {
        // token.accessToken = account.access_token;
        token.user = jwt.sign(user, process.env.JWT_SECRET);
        token.fname = '';
        token.lname = '';
      }

      return Promise.resolve(token);
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      token = token.user as JWT;
      // session.fname = token.fname;
      // session.lname = token.lname;

      prisma.$disconnect();
      return session;
    },
  },
};
export default NextAuth(authOptions);
