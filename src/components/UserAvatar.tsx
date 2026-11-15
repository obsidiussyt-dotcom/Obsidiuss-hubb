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

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'Ω';

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClass} object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`${sizeClass} shrink-0 bg-gradient-to-br from-purple-600/80 via-indigo-600/80 to-cyan-500/80 flex items-center justify-center font-extrabold text-white select-none ${className}`}
    >
      {initials}
    </div>
  );
};
