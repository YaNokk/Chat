import { forwardRef, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { request } from "../api";
import {
  Button,
  Checkbox,
  Col,
  Comment,
  Form,
  List,
  notification,
  Popover,
  Row,
  Spin,
  Typography,
} from "antd";
import { Upload } from "../components/Upload";
import TextArea from "antd/es/input/TextArea";
import {
  ArrowUpOutlined,
  FileAddOutlined,
  MessageOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { cloneDeep, isEmpty, map } from "lodash";
import { badWordsRegexp, dateFormat } from "../constants";
import CyrillicToTranslit from "cyrillic-to-translit-js";
import moment from "moment";
import { ColorPicker } from "../components/ColorPicker";
import * as CryptoJS from "crypto-js";
import { ObjectToFormData } from "../functions/objectToFormData";

const cyrillicToTranslit = new CyrillicToTranslit();

const key = CryptoJS.enc.Utf8.parse("8080808080808080");
const iv = CryptoJS.enc.Utf8.parse("8080808080808080");

export const Room = ({ create }) => {
  const params = useParams();
  const { state } = useLocation();
  const newRoomId = useRef();
  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);
  const unfilteredMessages = useRef([]);
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState(false);
  const [translate, setTranslate] = useState(false);
  const outerRef = useRef();
  const chatRef = useRef();
  const navigate = useNavigate();
  const getHistory = async () => {
    const response = await request("get", `rooms/${params.id}`);
    unfilteredMessages.current = response.data.messages;
    setMessages(response.data.messages);
  };

  const connect = async () => {
    try {
      const connection = new HubConnectionBuilder()
        .withUrl(`${process.env.REACT_APP_API}chat`, {
          accessTokenFactory: () => localStorage.getItem("token"),
        })
        .configureLogging(LogLevel.Information)
        .build();

      connection.on("ReceiveMessage", (message) => {
        unfilteredMessages.current = [...unfilteredMessages.current, message];
        setMessages((messages) => transformMessages([...messages, message]));
      });

      connection.on("onError", (error) => {
        notification.error({
          message: "Ошибка",
          description: error.msg,
        });
      });

      connection.onclose((e) => {
        setConnection();
      });

      await connection.start();
      if (!create) {
        await connection.invoke("JoinRoom", params.id);
      }
      setConnection(connection);
    } catch (e) {
      console.log(e);
    }
  };

  const uploadFile = (message) => {
    if (files.length) {
      request(
        "post",
        "file/upload",
        ObjectToFormData({
          MessageId: message,
          File: files[0],
        })
      ).then((response) => {
        setFiles([]);
      });
    }
  };

  const sendMessage = async (message, setValue) => {
    try {
      const response = await connection.invoke("SendToRoom", {
        message: encryptMessage(message),
        room: newRoomId.current || params.id,
        name: state?.groupName,
        members: state?.members,
        files: !isEmpty(files),
      });
      if (response?.messageFileId) uploadFile(response.messageFileId);
      if (response?.newRoomId) newRoomId.current = response.newRoomId;
      if (response.success) setValue("");
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };

  const encryptMessage = (message) => {
    return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(message), key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  };

  const closeConnection = async () => {
    try {
      await connection.stop();
    } catch (e) {
      console.log(e);
    }
  };

  const downHandler = () => {
    if (outerRef.current) {
      outerRef.current.scrollIntoView();
    }
  };

  useEffect(() => {
    setMessages(transformMessages(messages));
  }, [filter]);

  useEffect(() => {
    downHandler();
  }, [messages]);

  useEffect(() => {
    if (!create) {
      getHistory();
    }
    connect();
    return () => closeConnection();
  }, []);

  const transformMessages = (messages) => {
    let notClosuredFilter = filter;
    setFilter((prevState) => {
      notClosuredFilter = prevState;
      return prevState;
    });
    if (!notClosuredFilter) {
      return unfilteredMessages.current;
    }
    const copy = cloneDeep(messages);
    map(copy, (message) => {
      if (notClosuredFilter)
        message.content = message.content.replace(badWordsRegexp, "***");
    });
    return copy;
  };
  console.log(files, newRoomId);
  return (
    <Row>
      <Col span={8}>
        <Col span={24}>
          <Button onClick={() => navigate("/")}>Назад</Button>
        </Col>
        <Col span={24}>
          <Typography.Title>Переписка</Typography.Title>
        </Col>
        <Col span={24}>
          <Checkbox checked={filter} onChange={() => setFilter(!filter)}>
            Мат фильтр
          </Checkbox>
          <Checkbox
            checked={translate}
            onChange={() => setTranslate(!translate)}
          >
            Переводчик
          </Checkbox>
        </Col>
        <Col span={24}>
          <ColorPicker />
        </Col>
      </Col>
      <Col span={14}>
        <div className={"chat"}>
          <CommentList
            ref={{ outerRef: outerRef, chatRef: chatRef }}
            comments={messages}
          />
          <Comment
            content={
              <Editor
                setFiles={setFiles}
                onSubmit={sendMessage}
                downHandler={downHandler}
                translate={translate}
              />
            }
          />
        </div>
      </Col>
    </Row>
  );
};

const CommentList = forwardRef(
  ({ comments, firstRender, setFirstRender }, { outerRef, chatRef }) => {
    const innerRef = useRef(null);
    useEffect(() => {
      if (innerRef.current) {
        outerRef.current = innerRef.current;
      }
    }, [innerRef.current]);

    useEffect(() => {
      if (innerRef.current && firstRender && comments.length) {
        innerRef.current.scrollIntoView();
        setFirstRender(false);
      }
    }, [comments.length]);

    useEffect(() => {
      if (
        chatRef.current.scrollTop + chatRef.current.offsetHeight >=
        chatRef.current.scrollHeight - 75
      ) {
      }
    });

    return (
      <div
        className={"chat_list_wrapper"}
        ref={chatRef}
        onScroll={(e) => {
          const target = e.target;
          if (
            target.scrollTop + target.offsetHeight >=
            target.scrollHeight - 75
          ) {
          }
        }}
      >
        {comments.length <= 0 ? (
          <Spin spinning={true} />
        ) : (
          <List
            dataSource={comments}
            itemLayout="horizontal"
            renderItem={({ content, timestamp, user, datetime, file }) => {
              return true ? (
                <Comment
                  content={
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {content}
                      {map(file, (_file) => (
                        <a
                          key={_file.id}
                          target={"_blank"}
                          href={`${process.env.REACT_APP_API}file/download?filePath=${_file.filePath}`}
                        >
                          {_file.fileName}
                        </a>
                      ))}
                    </div>
                  }
                  avatar={user.avatar}
                  datetime={moment(timestamp).format(dateFormat)}
                  author={user.userName}
                />
              ) : (
                <div className={"chat_list_date"}>
                  {datetime.format("D MMMM")}
                </div>
              );
            }}
            loading={comments.length <= 0}
          />
        )}
        <div ref={innerRef} className={"chat_scroll"} />
      </div>
    );
  }
);

const Editor = ({ onSubmit, downHandler, newMessage, setFiles, translate }) => {
  const [value, setValue] = useState("");
  const onUpload = (info) => {
    setFiles(map(info.fileList, (file) => file.originFileObj));
  };
  const onChange = (e) => {
    const newValue = translate
      ? cyrillicToTranslit.transform(e.target.value)
      : e.target.value;
    setValue(newValue);
  };
  return (
    <Form.Item>
      <div className={"chat_input"}>
        <div className={"chat_input_icons"}>
          {newMessage ? (
            <div className={"chat_input_icon"} onClick={downHandler}>
              <MessageOutlined id={"comment"} height={"24"} width={"24"} />
            </div>
          ) : null}
          <div className={"chat_input_icon rotate"} onClick={downHandler}>
            <ArrowUpOutlined id={"arrow-top"} height={"24"} width={"24"} />
          </div>
        </div>
        <Popover
          trigger={["hover", "click"]}
          content={
            <Upload onChange={onUpload} multiple>
              <Button icon={<FileAddOutlined />}>Файл</Button>
            </Upload>
          }
        >
          <PaperClipOutlined />
        </Popover>
        <TextArea
          autoSize
          onChange={onChange}
          onPressEnter={(e) => {
            if (!e.shiftKey && e.code === "Enter") {
              e.preventDefault();
              onSubmit(value, setValue);
            }
          }}
          value={value}
        />
        <Button
          htmlType="submit"
          disabled={!value}
          onClick={() => {
            onSubmit(value, setValue);
          }}
          type="primary"
        >
          Отправить
        </Button>
      </div>
    </Form.Item>
  );
};
