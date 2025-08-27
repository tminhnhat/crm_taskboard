import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    outputFileTracingIncludes: {
      './src/app/api/code/route': ['./public/fonts/**/*'],
    },
}
module.exports = nextConfig
