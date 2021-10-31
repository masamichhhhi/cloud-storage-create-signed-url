import { client } from "../axiosClient";

type GenerateSignedUrlResponse = {
  signedUrl: string;
};

export const generateSignedUrl = async (
  ext: string
): Promise<GenerateSignedUrlResponse> => {
  const body = {
    ext: ext,
  };
  const response = await client.post<GenerateSignedUrlResponse>("/sign", body);
  return response.data;
};
