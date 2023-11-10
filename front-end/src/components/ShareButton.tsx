import Icon from './Icon';

interface ShareProps {
  path: string;
  title?: string;
  text?: string;
  className?: string;
}

const ShareButton = ({
  className,
  path,
  title,
  text
}: ShareProps): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const share = async (_e: React.MouseEvent) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: text,
          url: getUrl()
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getUrl = (): string => {
    const url =
      document.querySelector<HTMLAnchorElement>('.navbar-brand')?.href + path;
    return url.replace(/([^:]\/)\/+/g, '$1');
  };

  if (navigator['share']) {
    return (
      <button onClick={share} className={className}>
        <Icon icon="nf-fa-share_square_o"></Icon>
      </button>
    );
  } else {
    return <></>;
  }
};

export default ShareButton;