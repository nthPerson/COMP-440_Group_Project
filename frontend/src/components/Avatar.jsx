import React from 'react';

export default function Avatar({ src, alt = '', size = 40, username = '' }) {
  const fallback = 'https://api.iconify.design/mdi:account-circle.svg';
  const [imgSrc, setImgSrc] = React.useState(src || fallback);

  React.useEffect(() => {
    setImgSrc(src || fallback);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt || (username ? `${username}'s avatar` : 'avatar')}
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      onError={() => setImgSrc(fallback)}
    />
  );
}