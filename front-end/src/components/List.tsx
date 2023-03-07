const List = (props: { items: string[] }) => {
  if (!props.items || props.items.length === 0) {
    return <></>;
  }

  return (
    <ul className="list-group mt-3">
      {props.items.map((item: string, index: number) => (
        <li key={index} className="list-group-item">
          {item}
        </li>
      ))}
    </ul>
  );
};

export default List;
