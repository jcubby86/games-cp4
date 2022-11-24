const List = (props) => {
  if (!props.items || props.items.length === 0) {
    return <></>;
  }

  return (
    <ul className="list-group mt-3">
      {props.items.map((item, index) => (
        <li key={index} className="list-group-item">
          {item}
        </li>
      ))}
    </ul>
  );
};

export default List;
