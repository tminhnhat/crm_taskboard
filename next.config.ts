import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
 experimental: {
   outputFileTracingIncludes: {
      './src/app/api/code/route': ['./public/fonts/**/*'],
    },
  },
}
module.exports = nextConfig
