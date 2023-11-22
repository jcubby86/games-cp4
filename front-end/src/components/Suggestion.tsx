import { useEffect, useState } from 'react';

import axios from '../utils/axiosWrapper';
import { SuggestionDto } from '../utils/types';

const Suggestion = (): JSX.Element => {
  const [state, setState] = useState<SuggestionDto[]>([]);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get<SuggestionDto[]>('/api/suggestion');

      setState(response.data);
    } catch (err: unknown) {
      setState([]);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className="container-fluid">
      <h3>Suggestions</h3>
      <ul className="list-group mt-3">
        {state
          .sort(
            (a, b) =>
              a.category.localeCompare(b.category) * 1000 +
              a.value.localeCompare(b.value)
          )
          .map((item: SuggestionDto, index: number) => (
            <li key={index} className="list-group-item">
              {item.value} - {item.category}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Suggestion;
