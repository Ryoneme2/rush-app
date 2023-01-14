/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    HASH_SALT: process.env.HASH_SALT,
    TYPE_MEMBER_ID: process.env.TYPE_MEMBER_ID,
    TYPE_OWNER_ID: process.env.TYPE_OWNER_ID,
    TYPE_ADMIN_ID: process.env.TYPE_ADMIN_ID,
    CLOUD_ACCESS_KEY: process.env.CLOUD_ACCESS_KEY,
    CLOUD_SECRET_KEY: process.env.CLOUD_SECRET_KEY,
    CLOUD_REGION: process.env.CLOUD_REGION,
    CLOUD_S3_BUCKET: process.env.CLOUD_S3_BUCKET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_PROVIDER_ID: process.env.GOOGLE_PROVIDER_ID,
    TYPE_MEMBER_NAME: process.env.TYPE_MEMBER_NAME,
    TYPE_OWNER_NAME: process.env.TYPE_OWNER_NAME,
    TYPE_ADMIN_NAME: process.env.TYPE_ADMIN_NAME,
  },
  // webpack5:false
};

module.exports = nextConfig;
