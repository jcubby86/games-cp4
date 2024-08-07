import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import RecreateButton from '../components/RecreateButton';
import ShareButton from '../components/ShareButton';
import axios from '../utils/axiosWrapper';
import { logError } from '../utils/errorHandler';
import { StoryVariant } from '../utils/gameVariants';
import {
  StoryArchiveResBody as ArchiveResBody,
  StoryArchive as Story
} from '../utils/types';

interface StoryArchiveState extends ArchiveResBody {
  showAll: boolean;
}

export default function StoryArchive(): JSX.Element {
  const { gameId, playerId } = useParams();
  const [{ stories, showAll }, setState] = useState<StoryArchiveState>({
    stories: [],
    showAll: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStories() {
      try {
        const response = await axios.get<ArchiveResBody>(
          `/api/story/${gameId}`,
          controller
        );
        setState((prev) => ({ ...response.data, showAll: prev.showAll }));
      } catch (err: unknown) {
        logError(err);
      }
    }

    fetchStories();
    return () => controller.abort();
  }, [gameId]);

  const playerEntry = stories?.find((story) => playerId === story.player.id);
  const Items = (): JSX.Element => {
    if (playerEntry && !showAll) {
      return <ListItem item={playerEntry} index={0} />;
    } else {
      return (
        <>
          {stories?.map((item, index) => {
            return <ListItem item={item} index={index} key={index} />;
          })}
        </>
      );
    }
  };

  const ToggleButton = () => {
    const toggleAll = (e: React.MouseEvent) => {
      e.preventDefault();
      setState((prev) => ({ ...prev, showAll: !prev.showAll }));
    };

    if (playerEntry && stories?.length > 1) {
      return (
        <button className="btn btn-success col" onClick={toggleAll}>
          {showAll ? 'hide' : 'show all'}
        </button>
      );
    } else {
      return <></>;
    }
  };

  const ListItem = ({
    item,
    index
  }: {
    item: Story;
    index: number;
  }): JSX.Element => {
    return (
      <li key={index} className="list-group-item bg-light text-break">
        <div className="ms-2 me-auto">
          <p className="fw-bold mb-1">{item.player.nickname}</p>
          <p>{item.value}</p>
        </div>
      </li>
    );
  };

  const getPath = () => `/story/${gameId}` + (playerId ? `/${playerId}` : '');

  return (
    <div className="d-flex flex-column w-100">
      <div className="text-center">
        <h1 className="text-nowrap">{StoryVariant.title}</h1>
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
          />
          <ShareButton
            className="btn col-2"
            path={getPath()}
            title={'Games: ' + StoryVariant.title}
            text="Read my hilarious story!"
          />
        </div>
      </div>
    </div>
  );
}
