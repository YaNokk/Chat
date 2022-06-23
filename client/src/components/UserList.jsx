import { Avatar, List } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

export const UserList = ({
  users,
  roomMembers,
  onSetRoomMembers,
  createRoom,
  getNewRoom,
}) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={users}
      renderItem={(user) => (
        <List.Item key={user.id}>
          <List.Item.Meta
            avatar={<Avatar src={user.avatar} />}
            title={
              <Link state={user} to={`profile/${user.id}`}>
                {user.userName}
              </Link>
            }
          />
          <MessageOutlined onClick={() => getNewRoom(user.room?.id, user.id)} />
        </List.Item>
      )}
    />
  );
};
