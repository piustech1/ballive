import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Tv,
  Radio,
  RotateCcw,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { StreamSource, Match } from '../../types/football';

interface VideoPlayerProps {
  match: Match;
  activeSource?: StreamSource;
  onSourceChange?: (source: StreamSource) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  match,
  activeSource,
  onSourceChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [quality, setQuality] = useState<'1080p 60fps' | '720p HD' | '480p SD' | 'Auto'>('1080p 60fps');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const controlsTimeoutRef = useRef<number | null>(null);

  const currentStream = activeSource || (match.streams && match.streams[0]);

  // Initialize HLS / HTML5 Video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentStream) return;

    setIsLoading(true);
    setHasError(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = currentStream.url;

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().then(() => setIsPlaying(true)).catch(() => {
          // Autoplay blocked without user gesture
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setHasError(true);
              setIsLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
      video.addEventListener('error', () => {
        setHasError(true);
        setIsLoading(false);
      });
    } else {
      // Fallback
      video.src = streamUrl;
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [currentStream]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Controls auto-hide on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = newVol;
      video.muted = newVol === 0;
      setVolume(newVol);
      setIsMuted(newVol === 0);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const triggerGoalCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#FACC15', '#EF4444', '#10B981'],
    });
  };

  if (!match.hasLiveStream || !currentStream) {
    return (
      <div className="w-full aspect-video rounded-3xl bg-[#0F1420] border border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Tv className="w-8 h-8 text-sport-textMuted" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          Stream Not Currently Available
        </h3>
        <p className="text-xs sm:text-sm text-sport-textMuted max-w-md leading-relaxed mb-6">
          This match is scheduled for official broadcast by regional licensed rights-holders. Direct stream will begin 15 minutes before kickoff.
        </p>

        {match.broadcasters && match.broadcasters.length > 0 && (
          <div className="w-full max-w-sm rounded-2xl bg-white/5 p-4 border border-white/5 text-left">
            <span className="text-xs font-semibold text-sport-textMuted uppercase tracking-wider block mb-2">
              Official Broadcasters:
            </span>
            <div className="space-y-1.5 text-xs text-white">
              {match.broadcasters.map((b, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                  <span className="font-medium">{b.network}</span>
                  <span className="text-sport-textMuted">{b.region}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl group select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div className="w-12 h-12 border-3 border-sport-electricBlue border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-white tracking-wider uppercase">
            Buffering Live Stream...
          </span>
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-[#0B0E17]/90 flex flex-col items-center justify-center p-6 text-center gap-3">
          <AlertTriangle className="w-10 h-10 text-sport-coral" />
          <p className="text-sm font-bold text-white">Stream Temporarily Unavailable</p>
          <p className="text-xs text-sport-textMuted max-w-sm">
            The live streaming server encountered a glitch. You can retry the connection or switch to an alternate authorized stream angle.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              if (hlsRef.current) hlsRef.current.startLoad();
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-sport-electricBlue hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Top Overlay Badge Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-sport-coral text-white tracking-wide shadow-lg">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            LIVE
          </span>

          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-white border border-white/10 hidden sm:inline-block">
            {currentStream.channelName}
          </span>

          <span className="text-xs text-sport-emerald font-semibold hidden md:inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sport-emerald animate-ping" />
            {currentStream.latency || 'Low Latency'}
          </span>
        </div>

        {/* Goal celebration button */}
        <button
          onClick={triggerGoalCelebration}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-sport-accentYellow/20 hover:bg-sport-accentYellow/30 border border-sport-accentYellow/40 text-sport-accentYellow text-xs font-bold transition-transform hover:scale-105 active:scale-95"
          title="Celebrate goal with confetti!"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Goal FX</span>
        </button>
      </div>

      {/* Center Big Play/Pause Indicator (Tap feedback) */}
      {!isPlaying && !isLoading && !hasError && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-sport-electricBlue/90 hover:bg-sport-electricBlue text-white flex items-center justify-center shadow-glow-blue transition-transform hover:scale-110 active:scale-95"
          aria-label="Play match stream"
        >
          <Play className="w-7 h-7 fill-white ml-1" />
        </button>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress / Live scrubber indicator */}
        <div className="w-full flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-sport-coral animate-pulse" />
          </div>
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider shrink-0">
            LIVE 0.8s DELAY
          </span>
        </div>

        <div className="flex items-center justify-between">
          {/* Left Controls: Play/Pause, Volume */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-sport-neonBlue"
              />
            </div>
          </div>

          {/* Right Controls: Stream Source, Quality, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Stream Source Selector */}
            {match.streams && match.streams.length > 1 && (
              <select
                value={currentStream.id}
                onChange={e => {
                  const src = match.streams?.find(s => s.id === e.target.value);
                  if (src && onSourceChange) onSourceChange(src);
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white font-medium outline-none cursor-pointer"
              >
                {match.streams.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#121622] text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            {/* Quality Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{quality}</span>
              </button>

              {showSettingsMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-36 bg-[#121622] border border-white/10 rounded-xl overflow-hidden shadow-2xl py-1 text-xs z-50">
                  {(['1080p 60fps', '720p HD', '480p SD', 'Auto'] as const).map(q => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuality(q);
                        setShowSettingsMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-white/10 transition-colors ${
                        quality === q ? 'text-sport-neonBlue font-bold' : 'text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
