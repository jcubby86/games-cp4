import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import RecreateButton from '../components/RecreateButton';
import ShareButton from '../components/ShareButton';
import axios from '../utils/axiosWrapper';
import { StoryArchiveResponseBody } from '../utils/types';

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
  const { id, userId } = useParams();
  const [{ stories, showAll }, setState] = useState<StoryArchiveState>({
    showAll: false
  });
  const navigate = useNavigate();

  const pollStatus = async () => {
    try {
      const response = await axios.get<StoryArchiveResponseBody>(
        `/api/story/${id}`
      );
      setState((prev) => ({ ...response.data, showAll: prev.showAll }));
    } catch (err: unknown) {
      // navigate('/');
    }
  };

  useEffect(() => {
    pollStatus();
  }, []);

  const userItem = stories?.find(
    (i: Story) => !userId || showAll || userId === i.user.id
  );
  const Items = (): JSX.Element => {
    if (userItem) {
      return <ListItem item={userItem} index={0} />;
    } else {
      return (
        <>
          {stories?.map((item: Story, index: number) => {
            return <ListItem item={item} index={index} />;
          })}
        </>
      );
    }
  };

  const ToggleButton = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const toggleAll = (_e: React.MouseEvent) =>
      setState((prev) => ({ ...prev, showAll: !prev.showAll }));

    if (userItem) {
      return (
        <button className="btn btn-success col" onClick={toggleAll}>
          {showAll ? 'hide' : 'show all'}
        </button>
      );
    } else {
      return <></>;
    }
  };

  const ListItem = (props: { item: Story; index: number }): JSX.Element => {
    return (
      <li key={props.index} className="list-group-item bg-light">
        <div className="ms-2 me-auto">
          <p className="fw-bold mb-1">{props.item.user.nickname}</p>
          <p>{props.item.value}</p>
        </div>
      </li>
    );
  };

  const getPath = () => `/story/${id}` + (userId ? `/${userId}` : '');

  return (
    <div className="d-flex flex-column w-100">
      <div className="text-center">
        <h1 className="text-nowrap">He Said She Said</h1>
      </div>

      <ul className="list-group list-group-flush my-3 w-100">
        <Items />
      </ul>
      <div className="container-fluid">
        <div className="row gap-4">
          <ToggleButton />
          <RecreateButton
            reset={() => navigate('/story')}
            className="btn btn-outline-success col"
          ></RecreateButton>
          <ShareButton
            className="btn col-2"
            path={getPath()}
            title="Games: He Said She Said"
            text="Read my hilarious story!"
          ></ShareButton>
        </div>
      </div>
    </div>
  );
}
