import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Tv,
  RefreshCw,
  AlertTriangle,
  Radio,
  WifiOff,
} from 'lucide-react-native';
import Colors from '../../theme/colors';

export interface StreamMirror {
  id: string;
  name: string;
  url: string;
}

export interface LiveStreamPlayerProps {
  streamUrl?: string;
  streams?: StreamMirror[];
  isLive?: boolean;
  poster?: string;
  title?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  style?: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_HEIGHT = Math.round((SCREEN_WIDTH * 9) / 16);

export const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({
  streamUrl,
  streams = [],
  isLive = true,
  poster,
  title,
  homeTeamName,
  awayTeamName,
  isFullscreen = false,
  onToggleFullscreen,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);

  // Normalize server list
  const availableServers: StreamMirror[] = useMemo(() => {
    const list: StreamMirror[] = [];
    if (streams && streams.length > 0) {
      streams.forEach((s, idx) => {
        if (s.url) {
          list.push({
            id: s.id || `srv-${idx + 1}`,
            name: s.name || `Server ${idx + 1}`,
            url: s.url,
          });
        }
      });
    } else if (streamUrl) {
      list.push({
        id: 'srv-primary',
        name: 'Server 1 (HD)',
        url: streamUrl,
      });
    }
    return list;
  }, [streams, streamUrl]);

  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const activeStream = availableServers[selectedServerIndex] || null;

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  // Reset server index when stream source props change
  useEffect(() => {
    setSelectedServerIndex(0);
    setIsBuffering(true);
    setHasError(false);
    setErrorMessage('');
  }, [streamUrl, streams]);

  // Reset states when stream source changes
  useEffect(() => {
    setIsBuffering(true);
    setHasError(false);
    setErrorMessage('');
  }, [activeStream?.url, retryKey]);

  const handleServerChange = (index: number) => {
    if (index !== selectedServerIndex && availableServers[index]) {
      setSelectedServerIndex(index);
      setIsBuffering(true);
      setHasError(false);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsBuffering(true);
    setRetryKey(prev => prev + 1);
  };

  // Generate self-contained HTML5 + HLS.js player for WebView
  const playerHtml = useMemo(() => {
    const rawUrl = activeStream?.url || '';
    if (!rawUrl) return '';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            width: 100%;
            height: 100%;
            background-color: #0E0D14;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          #videoContainer {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000000;
          }
          video {
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: #000000;
          }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js"></script>
      </head>
      <body>
        <div id="videoContainer">
          <video
            id="streamVideo"
            playsinline
            webkit-playsinline
            autoplay
            controls
            controlsList="nodownload"
            poster="${poster || ''}"
          ></video>
        </div>

        <script>
          const video = document.getElementById('streamVideo');
          const initialSource = "${rawUrl}";

          function sendMessage(type, payload) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
            }
          }

          video.addEventListener('playing', () => sendMessage('playing'));
          video.addEventListener('waiting', () => sendMessage('buffering'));
          video.addEventListener('ended', () => sendMessage('ended'));
          video.addEventListener('error', (e) => {
            const err = video.error ? (video.error.message || 'Video playback error') : 'Unknown error';
            sendMessage('error', { message: err });
          });

          async function startStream() {
            let streamSource = initialSource;

            // If the stream source is a JSON metadata endpoint, resolve the manifest or external URL first
            if (streamSource.includes('/stream/tv/') || streamSource.endsWith('.json')) {
              try {
                const res = await fetch(streamSource, {
                  headers: { 'Referer': 'https://s-u.in/', 'Origin': 'https://s-u.in' }
                });
                if (res.ok) {
                  const data = await res.json();
                  const first = (data.streams || [])[0];
                  if (first && (first.url || first.externalUrl)) {
                    streamSource = first.url || first.externalUrl;
                  }
                }
              } catch (e) {
                console.log('Stream resolution failed, falling back:', e);
              }
            }

            // If the stream source is an embed or web player (e.g. damitv / watch?url=...)
            const isWebEmbed = streamSource.includes('/watch?') || streamSource.includes('/embed/') || (!streamSource.includes('.m3u8') && !streamSource.includes('/manifest') && !streamSource.includes('/api/manifest') && !streamSource.includes('.ts'));
            if (isWebEmbed) {
              const container = document.getElementById('videoContainer');
              if (container) {
                container.innerHTML = '<iframe src="' + streamSource + '" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen style="width:100%;height:100%;border:none;background:#000;"></iframe>';
                sendMessage('playing');
                return;
              }
            }

            if (Hls.isSupported()) {
              const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 30,
                maxBufferLength: 30,
                manifestLoadingMaxRetry: 5,
                levelLoadingMaxRetry: 5,
                fragLoadingMaxRetry: 6,
              });

              hls.loadSource(streamSource);
              hls.attachMedia(video);

              hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function(e) {
                  console.log('Autoplay deferred:', e);
                });
              });

              hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      console.log('Network stall, retrying manifest load...');
                      hls.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      console.log('Media error, recovering buffer...');
                      hls.recoverMediaError();
                      break;
                    default:
                      hls.destroy();
                      sendMessage('error', { message: 'Feed offline or satellite signal weak' });
                      break;
                  }
                }
              });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = streamSource;
              video.addEventListener('loadedmetadata', function () {
                video.play().catch(function(e) {
                  console.log('Native autoplay blocked:', e);
                });
              });
            } else {
              sendMessage('error', { message: 'HLS streaming not supported in this environment.' });
            }
          }

          startStream();
        </script>
      </body>
      </html>
    `;
  }, [activeStream?.url, poster, retryKey]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'playing') {
        setIsBuffering(false);
        setIsPlaying(true);
        setHasError(false);
      } else if (data.type === 'buffering') {
        setIsBuffering(true);
      } else if (data.type === 'error') {
        setIsBuffering(false);
        setHasError(true);
        setErrorMessage(data.payload?.message || 'Broadcast stream is offline');
      }
    } catch {
      // ignore
    }
  };

  // If no stream source is available or stream is flagged offline
  const isOffline = !activeStream || !activeStream.url || hasError;

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer, style]}>
      {/* ── 1. WIDESCREEN 16:9 VIDEO VIEWPORT ── */}
      <View style={[styles.videoViewport, isFullscreen && styles.fullscreenViewport]}>
        {!isOffline ? (
          <View style={StyleSheet.absoluteFill}>
            <WebView
              key={`webview-${activeStream?.url || 'none'}-${selectedServerIndex}-${retryKey}`}
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: playerHtml, baseUrl: 'https://s-u.in/' }}
              userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36"
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              mixedContentMode="always"
              onMessage={handleMessage}
              onError={() => {
                setHasError(true);
                setErrorMessage('Failed to load video stream feed');
              }}
            />

            {/* Buffering Indicator Overlay */}
            {isBuffering && (
              <View style={styles.bufferingOverlay} pointerEvents="none">
                <ActivityIndicator size="large" color="#7952FC" />
                <Text style={styles.bufferingText}>Connecting live satellite feed...</Text>
              </View>
            )}
          </View>
        ) : (
          /* ── STREAM OFFLINE / RECONNECTING BACKDROP ── */
          <View style={styles.offlineSurface}>
            <View style={styles.offlineIconRing}>
              <WifiOff size={28} color="#EF4444" strokeWidth={2.2} />
            </View>
            <Text style={styles.offlineTitle}>Broadcast Stream Offline</Text>
            <Text style={styles.offlineSubtitle}>
              {errorMessage || 'Satellite feed is connecting or temporarily paused for this fixture.'}
            </Text>

            <View style={styles.offlineActionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.retryBtn}
                onPress={handleRetry}
              >
                <RefreshCw size={14} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.retryBtnText}>Retry Connection</Text>
              </TouchableOpacity>

              {availableServers.length > 1 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.switchServerBtn}
                  onPress={() => {
                    const nextIdx = (selectedServerIndex + 1) % availableServers.length;
                    handleServerChange(nextIdx);
                  }}
                >
                  <Tv size={14} color="#7952FC" strokeWidth={2.2} />
                  <Text style={styles.switchServerBtnText}>Next Mirror</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── FLOATING CONTROLS (UNOBTRUSIVE FULLSCREEN TOGGLE) ── */}
        <View style={styles.topOverlay} pointerEvents="box-none">
          <View style={{ flex: 1 }} />

          {onToggleFullscreen && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.fullscreenBtn}
              onPress={onToggleFullscreen}
              accessibilityLabel={isFullscreen ? 'Exit full screen' : 'Full screen'}
            >
              {isFullscreen ? (
                <Minimize2 size={18} color="#FFFFFF" strokeWidth={2.4} />
              ) : (
                <Maximize2 size={18} color="#FFFFFF" strokeWidth={2.4} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000000',
  },
  fullscreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  videoViewport: {
    width: SCREEN_WIDTH,
    height: DEFAULT_HEIGHT,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  fullscreenViewport: {
    width: '100%',
    height: '100%',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 13, 20, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 10,
  },
  bufferingText: {
    color: '#ECE6F0',
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  offlineSurface: {
    flex: 1,
    backgroundColor: '#151322',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 6,
  },
  offlineIconRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  offlineTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  offlineSubtitle: {
    color: '#A098B5',
    fontSize: 11.5,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 280,
  },
  offlineActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7952FC',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  switchServerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(121, 82, 252, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  switchServerBtnText: {
    color: '#7952FC',
    fontSize: 11.5,
    fontWeight: '600',
  },
  topOverlay: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  fullscreenBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(14, 13, 20, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenMirrorBar: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(14, 13, 20, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 20,
  },
  // Seamless Dock Bar directly below 16:9 video frame
  dockBar: {
    height: 38,
    backgroundColor: '#161324',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dockLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dockLabel: {
    color: '#A098B5',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dockSegmentGroup: {
    flexDirection: 'row',
    backgroundColor: '#1E192D',
    borderRadius: 8,
    padding: 2,
    gap: 3,
  },
  dockSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dockSegmentActive: {
    backgroundColor: '#7952FC',
  },
  dockSegmentText: {
    color: '#A098B5',
    fontSize: 10.5,
    fontWeight: '600',
  },
  dockSegmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
