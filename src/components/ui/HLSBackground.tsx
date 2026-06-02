import { useRef, useState } from 'react';

interface VideoBackgroundProps {
  src: string;
}

export function HLSBackground({ src }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <video
        ref={videoRef}
        src={src}
        muted
        autoPlay
        loop
        playsInline
        onPlaying={() => setIsLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ filter: 'brightness(0.8)' }}
      />

      {/* Very subtle radial vignette to ensure center text pop while edge video stays bright */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.2)_100%)] pointer-events-none" />

      {/* Bottom fade — dark to match the video, NOT bg-background (which is white in light mode) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </div>
  );
}

