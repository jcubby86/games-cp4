import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Story {
  value: string;
  user: { nickname: string; id: string };
}

interface StoryArchiveState {
  id?: string;
  stories?: Story[];
  showAll: boolean;
}

export default function StoryArchive(): JSX.Element {
  const { id, user } = useParams();
  const [{ stories, showAll }, setState] = useState<StoryArchiveState>({
    showAll: false
  });

  const pollStatus = async () => {
    try {
      const response = await axios.get(`/api/story/${id}`);
      setState((prev) => ({ ...response.data, showAll: prev.showAll }));
    } catch (error) {
      // navigate('/');
    }
  };
  const nicknameFilter = (i: Story) => !user || showAll || user === i.user.id;

  useEffect(() => {
    pollStatus();
  }, []);

  return (
    <>
      <div className="d-flex flex-column w-100">
        <div className="text-center">
          <h1 className="text-nowrap">He Said She Said</h1>
        </div>

        <ul className="list-group list-group-flush my-3 w-100">
          {stories?.filter(nicknameFilter).map((item: Story, index: number) => (
            <li key={index} className="list-group-item bg-light">
              <div className="ms-2 me-auto">
                <div className="fw-bold mb-1">{item.user.nickname}</div>
                {item.value}
              </div>
            </li>
          ))}
        </ul>

        {user && (
          <button
            className={'btn btn-outline-success'}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onClick={(_e) =>
              setState((prev) => ({ ...prev, showAll: !prev.showAll }))
            }
          >
            {showAll ? 'hide' : 'show all'}
          </button>
        )}
      </div>
    </>
  );
}
