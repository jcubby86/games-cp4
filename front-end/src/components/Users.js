const Users = (props) => {
  return (
    <ul className="list-group mt-3">
      {props.users.map((user, index) => (
        <li key={index} className="list-group-item">
          {user}
        </li>
      ))}
    </ul>
  );
};

export default Users;
