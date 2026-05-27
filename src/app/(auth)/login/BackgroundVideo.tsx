'use client';

export default function BackgroundVideo() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      onError={(e) => console.error('[BackgroundVideo] error:', e.currentTarget.error)}
      onLoadedData={() => console.log('[BackgroundVideo] loaded')}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 0,
      }}
    >
      <source src="/videos/8114287-uhd_4096_2160_25fps.mp4" type="video/mp4" />
    </video>
  );
}
