import multiparty from "multiparty";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import mime from "mime-types";

import { mongooseConnect } from "@/lib/mongoose";
import { authenticate } from "@/lib/auth";

const S3BucketName = process.env.S3_BUCKET_NAME;

export default async function ImageHandler(req, res) {
  if (!(await authenticate(req, res))) return;

  await mongooseConnect();

  const form = new multiparty.Form({ maxFilesSize: 10 * 1024 * 1024 });

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (error, fields, files) => {
        if (error) reject(error);
        else resolve({ fields, files });
      });
    });

    if (!files.file || files.file.length === 0) {
      return res.status(400).json({ error: "No file provided" });
    }

    const client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });

    const links = [];
    for (const file of files.file) {
      const ext = (file.originalFilename || "").split(".").pop();
      const imageFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      try {
        const fileBody = fs.readFileSync(file.path);
        await client.send(
          new PutObjectCommand({
            Bucket: S3BucketName,
            Key: imageFileName,
            Body: fileBody,
            ContentType: mime.lookup(file.path) || "application/octet-stream",
          })
        );

        const link = `https://${S3BucketName}.s3.amazonaws.com/${imageFileName}`;
        links.push(link);
      } catch (uploadError) {
        console.error("S3 upload error:", imageFileName, uploadError.message);
      }
    }

    if (links.length === 0) {
      return res.status(500).json({ error: "Upload to S3 failed. Check your AWS credentials." });
    }

    res.json({ message: "Upload successful", links, fields });
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).json({ error: "File upload failed" });
  }
}

export const config = {
  api: { bodyParser: false },
};
