interface ListProps {
  items?: string[];
}

const List = ({ items }: ListProps): JSX.Element => {
  if (!items || items.length === 0) {
    return <></>;
  }

  return (
    <ul className="list-group mt-3">
      {items.map((item: string, index: number) => (
        <li key={index} className="list-group-item">
          {item}
        </li>
      ))}
    </ul>
  );
};

export default List;
