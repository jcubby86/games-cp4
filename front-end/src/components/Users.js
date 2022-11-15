const Users = (props) => {
  return (
    <ul className="list-group mt-3">
      {props.users.map((user) => (
        <li key={user.nickname} className="list-group-item">
          {user.nickname}
        </li>
      ))}
    </ul>
  );
};

export default Users;
