FROM --platform=linux/amd64 node:16-alpine3.16 AS deps
# RUN apk add --no-cache libc6-compat openssl1.1-compat
WORKDIR /app

# Install Prisma Client - remove if not using Prisma

COPY prisma ./
COPY tsconfig.json ./

# Install dependencies based on the preferred package manager

COPY package.json yarn.lock*  ./

RUN yarn --frozen-lockfile;

RUN npx prisma generate

##### BUILDER

FROM --platform=linux/amd64 node:16-alpine3.16 AS builder
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/tsconfig.json ./
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn --frozen-lockfile;

RUN yarn run build

##### RUNNER

FROM --platform=linux/amd64 node:16-alpine3.16 AS runner
WORKDIR /app

ENV NODE_ENV production
# ENV NODE_ENV production
# ENV DATABASE_URL=postgresql://postgres:qF6YqlCM6HNH@rush-db.c2ky36zcbpor.ap-southeast-1.rds.amazonaws.com/rushapp

# ENV NODE_ENV development
ENV DATABASE_URL=postgresql://theerakarn:7f05UrLVP4MJ0QwV1OHAew@wonder-krill-3574.6xw.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full

ENV NEXTAUTH_URL=https://rushbooking.co/

ENV NEXTAUTH_URL_INTERNAL=https://rushbooking.co/


ENV JWT_SECRET=PIYAPON

ENV HASH_SALT=10

ENV TYPE_MEMBER_NAME=Member
ENV TYPE_OWNER_NAME=Owner
ENV TYPE_ADMIN_NAME=SuperAdmin

ENV CLOUD_ACCESS_KEY=AKIA3TVTQGFJAIYM435Q
ENV CLOUD_SECRET_KEY=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
ENV CLOUD_REGION=ap-southeast-1
ENV CLOUD_S3_BUCKET=rush-bk


ENV GOOGLE_CLIENT_ID = 1092820790605-1scci8f11fl9k75qitst25ff7old7o3j.apps.googleusercontent.com
ENV GOOGLE_CLIENT_SECRET = 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
ENV GOOGLE_PROVIDER_ID = 1 

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]

# CMD ["yarn", "start"]