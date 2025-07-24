import { CurrentWebBaseURL } from "@/shared/constants/url.constant";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/" + CurrentWebBaseURL,
};

export default nextConfig;
