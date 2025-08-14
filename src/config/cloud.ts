import { v2 as cloudinary, ConfigOptions } from "cloudinary";

const cloudConfig: ConfigOptions = {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
};

cloudinary.config(cloudConfig);

export default cloudinary;
