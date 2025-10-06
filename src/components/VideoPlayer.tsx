'use client';

import React from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ 
  playerRef,
  src, 
  onReady, 
  onPlay, 
  onPause, 
  onEnded, 
  onError,
  onProgress,
  onDuration,
  playing = false, 
  volume = 1,
  muted = false,
  isMobile = false,
  width = "100%", 
  height = "100%"
}) => {
  
  const [playerConfig, setPlayerConfig] = React.useState({});

  React.useEffect(() => {
    setPlayerConfig({
      youtube: {
        playerVars: {
          showinfo: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1,
          cc_load_policy: 0,
          autohide: 1,
          playsinline: 1,
          origin: window.location.origin
        },
      },
      file: {
        forceHLS: true,
        hlsVersion: '1.5.8',
        attributes: {
          poster: "", 
          controlsList: 'nodownload noremoteplayback', 
          disablePictureInPicture: true,
          playsInline: true
        }
      }
    });
  }, []);

  const playerStyle = { position: 'absolute', top: 0, left: 0 };
  const wrapperClass = isMobile ? "w-full h-full relative bg-black" : "w-full h-full relative bg-black rounded-xl overflow-hidden";

  return (
    <div className={wrapperClass}>
      <ReactPlayer
        ref={playerRef}
        url={src || ""}
        playing={playing}
        controls={false} 
        width={width}
        height={height}
        className="react-player"
        playsInline={true}
        volume={volume}
        muted={muted}
        onReady={() => onReady(playerRef.current)}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onError={onError}
        onProgress={onProgress}
        onDuration={onDuration}
        config={playerConfig}
        style={playerStyle}
      />
      {/* Overlay to prevent clicks on the player itself */}
      <div
        className="absolute inset-0 z-10"
        onClick={(e) => e.stopPropagation()}
      ></div>
    </div>
  );
};

export default VideoPlayer;
