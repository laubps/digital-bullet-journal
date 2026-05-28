'use client';

import type { CSSProperties } from 'react';
import { C } from '@/lib/ui/theme';

type Props = {
  /** If provided, renders a looping muted video instead of the default image. */
  videoSrc?: string;
  /** Override the overlay color. Defaults to the login overlay tone. */
  overlayColor?: string;
};

const IMAGE_SRC = '/img/main-background.png';

export default function PageBackground({ videoSrc, overlayColor = C.overlayBg }: Props) {
  const layer: CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  };

  const media: CSSProperties = {
    ...layer,
    objectFit: 'cover',
  };

  const overlay: CSSProperties = {
    ...layer,
    background: overlayColor,
    pointerEvents: 'none',
    zIndex: 1,
  };

  return (
    <>
      {videoSrc ? (
        <video autoPlay muted loop playsInline style={media}>
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        // Plain <img> keeps the background fixed without Next/Image hydration cost.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={IMAGE_SRC} alt="" style={media} aria-hidden="true" />
      )}
      <div style={overlay} />
    </>
  );
}
