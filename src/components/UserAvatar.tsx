import React from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  sizeClass?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'User',
  sizeClass = 'w-8 h-8 text-xs',
  className = '',
}) => {
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [src]);

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'O';

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${sizeClass} object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`${sizeClass} shrink-0 bg-gradient-to-br from-blue-600 via-sky-500 to-pink-500 flex items-center justify-center font-extrabold text-white select-none ${className}`}
    >
      {initials}
    </div>
  );
};
