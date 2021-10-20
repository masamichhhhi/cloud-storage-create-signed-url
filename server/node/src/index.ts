import express, { Request, Response } from "express";
import { GetSignedUrlConfig, Storage } from "@google-cloud/storage";
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

const server = express();
const router = express.Router();
const storage = new Storage();

router.post("/sign", async (_: Request, res: Response): Promise<void> => {
  const url = await generateV4UploadSignedUrl();
  res.send({
    signedUrl: url,
  });
});

server.use(router);
server.listen(process.env.PORT ?? 3000, () => {
  console.log("listen on port 3000");
});

const generateV4UploadSignedUrl = async (): Promise<string> => {
  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType: "application/octet-stream",
  };

  const [url] = await storage
    .bucket(process.env.UPLOADABLE_BUCKET ?? "")
    .file("aaa")
    .getSignedUrl(options);

  return url;
};
