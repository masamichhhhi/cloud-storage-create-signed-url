import axios from "axios";

export const uploadFileToSignedUrl = async (request: {
  signedUrl: string;
  file: File;
}): Promise<void> => {
  const client = axios.create({
    headers: {
      "Content-type": "application/octet-stream",
      "Access-Control-Allow-Origin": "*",
    },
  });

  const response = await client.put(request.signedUrl, request.file);
  console.log(response);
};
