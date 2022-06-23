import { Avatar, Comment, List } from "antd";
import { useContext } from "react";
import { AuthContext } from "../routing/AuthProvider";
import { find, isEmpty } from "lodash";
import moment from "moment";
import { dateFormat } from "../constants";
import group from "../static/group.jpg";

export const RoomList = ({ rooms, getRoom }) => {
  const { user } = useContext(AuthContext);
  return (
    <List
      itemLayout="horizontal"
      dataSource={rooms}
      renderItem={(room) => {
        const member = find(room.members, (member) => member.id !== user.id);
        return (
          <div onClick={() => getRoom(room.id)}>
            <Comment
              key={room.id}
              author={room.name || member?.userName}
              avatar={<Avatar src={room.name ? group : member.avatar} />}
              content={
                room.lastMessage?.content ||
                (isEmpty(room.lastMessage?.file) ? "" : "Файл")
              }
              datetime={
                room.lastMessage?.timestamp &&
                moment(room.lastMessage?.timestamp).format(dateFormat)
              }
            />
          </div>
        );
      }}
    />
  );
};
