import { v2 as cloudinary, ConfigOptions } from "cloudinary";
import * as dotenv from "dotenv"

let path = "./.env.production"
dotenv.config({ path })

console.log('Cloud Name:', process.env.CLOUD_NAME);
console.log('Cloud Key:', process.env.CLOUD_KEY);
console.log('Cloud Secret:', process.env.CLOUD_SECRET);

const cloudConfig: ConfigOptions = {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
};

cloudinary.config(cloudConfig);

export default cloudinary;
