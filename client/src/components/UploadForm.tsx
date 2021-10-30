import axios from "axios";
import React, { useCallback, useState } from "react";
import { client } from "../axiosClient";

type Props = {};

const UploadForm: React.FC<Props> = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);

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
      try {
        const ext = file?.name.split(".").pop();

        console.log(ext);

        const body = {
          ext: ext,
        };

        const res = await client.post("/sign", body, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log(res);
      } catch (err) {
        console.log(err);
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
    <form
      onSubmit={onSubmitHandler}
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <input type="file" accept="image/*, video/*" onChange={onChangeHandler} />
      <button type="submit">upload</button>
    </form>
  );
};

export default UploadForm;
