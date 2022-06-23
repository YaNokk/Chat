import { Upload as AntdUpload } from "antd";

export const Upload = ({ children, ...rest }) => {
  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  return (
    <AntdUpload
      name={"avatar"}
      action={process.env.REACT_HOST}
      customRequest={dummyRequest}
      {...rest}
    >
      {children}
    </AntdUpload>
  );
};
