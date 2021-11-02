import axios from "axios";
import React, { useCallback, useState } from "react";
import { generateSignedUrl } from "../api/generateSignedUrl";
import { client } from "../api/axiosClient";
import { uploadFileToSignedUrl } from "../api/uploadFile";

type Props = {};

const UploadForm: React.FC<Props> = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSucceeded, setIsSucceeded] = useState(false);
  const [url, setUrl] = useState("");

  const onChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setFile(files[0]);
      }
    },
    [setFile]
  );

  const uploadFile = useCallback(
    async (data) => {
      setLoading(true);
      try {
        if (!file) {
          return;
        }
        const ext = file?.name.split(".").pop();
        if (!ext) {
          return;
        }

        const response = await generateSignedUrl(ext);

        await uploadFileToSignedUrl({
          signedUrl: response.signedUrl,
          file: file,
        });
        setUrl(response.url);
        setIsSucceeded(true);
      } catch (err) {
        console.log(err);
        setError(JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    },
    [file]
  );

  const onSubmitHandler = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      uploadFile({
        file: file,
      });
    },
    [uploadFile, file]
  );
  return (
    <div>
      <form
        onSubmit={onSubmitHandler}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <input
          type="file"
          accept="image/*, video/*"
          onChange={onChangeHandler}
        />
        <button type="submit">upload</button>
      </form>

      {loading && (
        <span style={{ display: "flex", justifyContent: "center" }}>
          アップロード中
        </span>
      )}
      {error && (
        <span style={{ display: "flex", justifyContent: "center" }}>
          {error}
        </span>
      )}
      {isSucceeded && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div>アップロードに成功しました</div>
          <img src={url} alt="uploadedImage" />
        </div>
      )}
    </div>
  );
};

export default UploadForm;
