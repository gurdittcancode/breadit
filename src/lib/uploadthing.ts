import { OurFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react";

export const { uploadFiles } = generateReactHelpers<OurFileRouter>();
