import express, { Request, Response } from "express";
import { GetSignedUrlConfig, Storage } from "@google-cloud/storage";
import bodyParser from "body-parser";
import * as crypto from "crypto";
import cors from "cors";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

const server = express();
const router = express.Router();
const storage = new Storage();

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(
  cors({
    origin: "*",
  })
);

router.post("/sign", async (req: Request, res: Response): Promise<void> => {
  const ext = req.body.ext;
  if (!ext) {
    res.status(400).send({
      error: "extension required",
    });
  }
  const fileName = crypto.randomBytes(20).toString("hex");

  const url = await generateV4UploadSignedUrl(`${fileName}.${ext}`);
  res.send({
    signedUrl: url,
    url: `https://storage.googleapis.com/${process.env.UPLOADABLE_BUCKET}/${fileName}.${ext}`,
  });
});

server.use(router);
server.listen(process.env.PORT ?? 3000, () => {
  console.log("listen on port 3000");
});

const generateV4UploadSignedUrl = async (fileName: string): Promise<string> => {
  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType: "application/octet-stream",
  };

  const [url] = await storage
    .bucket(process.env.UPLOADABLE_BUCKET ?? "")
    .file(fileName)
    .getSignedUrl(options);

  return url;
};
