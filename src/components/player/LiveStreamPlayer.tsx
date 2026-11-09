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

            // If the stream source is a JSON metadata endpoint, resolve the manifest URL first
            if (streamSource.includes('/stream/tv/') || streamSource.endsWith('.json')) {
              try {
                const res = await fetch(streamSource, {
                  headers: { 'Referer': 'https://s-u.in/', 'Origin': 'https://s-u.in' }
                });
                if (res.ok) {
                  const data = await res.json();
                  const first = (data.streams || [])[0];
                  if (first && first.url) {
                    streamSource = first.url;
                  }
                }
              } catch (e) {
                console.log('Stream resolution failed, falling back:', e);
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
    <View style={[styles.container, isFullscreen ? styles.fullscreenContainer : { height: DEFAULT_HEIGHT }, style]}>
      {/* ── REAL HLS STREAM VIDEO SURFACE ── */}
      {!isOffline ? (
        <View style={StyleSheet.absoluteFill}>
          <WebView
            key={`stream-${selectedServerIndex}-${retryKey}`}
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
            <WifiOff size={32} color="#EF4444" strokeWidth={2.2} />
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
              <RefreshCw size={15} color="#FFFFFF" strokeWidth={2.4} />
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
                <Tv size={15} color="#7952FC" strokeWidth={2.2} />
                <Text style={styles.switchServerBtnText}>Switch Server</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── TOP LIVE PILL OVERLAY ── */}
      <View style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.liveIndicatorPill}>
          <View style={[styles.pulsingDot, isOffline && { backgroundColor: '#EF4444' }]} />
          <Text style={styles.liveIndicatorText}>
            {isOffline ? 'OFFLINE' : 'LIVE FEED'}
          </Text>
        </View>

        {onToggleFullscreen && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.fullscreenBtn}
            onPress={onToggleFullscreen}
            accessibilityLabel={isFullscreen ? 'Exit full screen' : 'Full screen'}
          >
            {isFullscreen ? (
              <Minimize2 size={16} color="#FFFFFF" strokeWidth={2.4} />
            ) : (
              <Maximize2 size={16} color="#FFFFFF" strokeWidth={2.4} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ── BOTTOM SERVER SELECTOR BAR ── */}
      {availableServers.length > 1 && (
        <View style={styles.serverSelectorBar}>
          <Tv size={14} color="#A098B5" strokeWidth={2.2} />
          <Text style={styles.serverSelectorLabel}>Mirrors:</Text>
          <View style={styles.serverPillsRow}>
            {availableServers.map((srv, idx) => {
              const isSelected = idx === selectedServerIndex;
              return (
                <TouchableOpacity
                  key={srv.id || `srv-${idx}`}
                  activeOpacity={0.8}
                  style={[styles.serverPill, isSelected && styles.serverPillActive]}
                  onPress={() => handleServerChange(idx)}
                >
                  <Text style={[styles.serverPillText, isSelected && styles.serverPillTextActive]}>
                    {srv.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#0E0D14',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  fullscreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 0,
    borderWidth: 0,
  },
  webView: {
    flex: 1,
    backgroundColor: '#0E0D14',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 13, 20, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 10,
  },
  bufferingText: {
    color: '#ECE6F0',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  offlineSurface: {
    flex: 1,
    backgroundColor: '#171622',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  offlineIconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  offlineTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  offlineSubtitle: {
    color: '#A098B5',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  offlineActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7952FC',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#7952FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  switchServerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(121, 82, 252, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(121, 82, 252, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  switchServerBtnText: {
    color: '#7952FC',
    fontSize: 12,
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
    gap: 6,
    backgroundColor: 'rgba(14, 13, 20, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  liveIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  fullscreenBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(14, 13, 20, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverSelectorBar: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(14, 13, 20, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 20,
  },
  serverSelectorLabel: {
    color: '#A098B5',
    fontSize: 11,
    fontWeight: '600',
  },
  serverPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  serverPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  serverPillActive: {
    backgroundColor: '#7952FC',
  },
  serverPillText: {
    color: '#A098B5',
    fontSize: 10,
    fontWeight: '600',
  },
  serverPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
