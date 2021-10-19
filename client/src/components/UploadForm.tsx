import axios from "axios";
import React, { useCallback, useState } from "react";
import { client } from "../axiosClient";

type Props = {};

const UploadForm: React.FC<Props> = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);

  const onChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        setFile(files[0]);
      }
    },
    []
  );

  const uploadFile = useCallback(async (data) => {
    try {
      const params = new FormData();
      const res = await client.post("/sign", params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

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
    <form onSubmit={onSubmitHandler}>
      <input type="file" accept="image/*, video/*" onChange={onChangeHandler} />
    </form>
  );
};

export default UploadForm;
