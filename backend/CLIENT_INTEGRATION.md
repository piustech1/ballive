# Mobile App Client Integration Guide

This guide shows how to connect your new streaming app to this API backend.
Because the API serves universal `.m3u8` streams and auto-relays video chunks with the required anti-hotlink headers, **your mobile video player does NOT need any custom header configurations**.

---

## 1. Flutter Integration (Dart)

### Dependencies (`pubspec.yaml`)
```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.0
  video_player: ^2.8.2
  chewie: ^1.7.5
```

### Models & API Service (`api_service.dart`)
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class MatchItem {
  final String id;
  final String title;
  final String sport;
  final String poster;
  final String playUrl;

  MatchItem({
    required this.id,
    required this.title,
    required this.sport,
    required this.poster,
    required this.playUrl,
  });

  factory MatchItem.fromJson(Map<String, dynamic> json) {
    return MatchItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      sport: json['sport'] ?? 'Sports',
      poster: json['poster'] ?? '',
      playUrl: json['play_url'] ?? '',
    );
  }
}

class ApiService {
  // Replace with your production server URL or your local machine IP (e.g. http://192.168.1.100:8080)
  static const String baseUrl = 'http://10.0.2.2:8080'; // 10.0.2.2 for Android Emulator, localhost for iOS Simulator

  static Future<List<MatchItem>> getLiveMatches({String genre = 'Football'}) async {
    final response = await http.get(Uri.parse('$baseUrl/api/v1/sports/live?genre=$genre'));
    if (response.statusCode == 200) {
      final Map<String, dynamic> body = json.decode(response.body);
      final List items = body['data'] ?? [];
      return items.map((m) => MatchItem.fromJson(m)).toList();
    }
    throw Exception('Failed to load live matches');
  }

  static Future<List<dynamic>> getMovies() async {
    final response = await http.get(Uri.parse('$baseUrl/api/v1/movies/latest'));
    if (response.statusCode == 200) {
      return json.decode(response.body)['data'] ?? [];
    }
    return [];
  }
}
```

### Video Player Screen (`player_screen.dart`)
```dart
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';

class LivePlayerScreen extends StatefulWidget {
  final String streamUrl;
  final String title;

  const LivePlayerScreen({Key? key, required this.streamUrl, required this.title}) : super(key: key);

  @override
  _LivePlayerScreenState createState() => _LivePlayerScreenState();
}

class _LivePlayerScreenState extends State<LivePlayerScreen> {
  late VideoPlayerController _videoController;
  ChewieController? _chewieController;

  @override
  void initState() {
    super.initState();
    _initPlayer();
  }

  Future<void> _initPlayer() async {
    _videoController = VideoPlayerController.networkUrl(Uri.parse(widget.streamUrl));
    await _videoController.initialize();
    _chewieController = ChewieController(
      videoPlayerController: _videoController,
      autoPlay: true,
      isLive: true,
      aspectRatio: 16 / 9,
    );
    setState(() {});
  }

  @override
  void dispose() {
    _videoController.dispose();
    _chewieController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      backgroundColor: Colors.black,
      body: Center(
        child: _chewieController != null && _chewieController!.videoPlayerController.value.isInitialized
            ? Chewie(controller: _chewieController!)
            : const CircularProgressIndicator(color: Colors.green),
      ),
    );
  }
}
```

---

## 2. React Native Integration (TypeScript)

### Dependencies
```bash
npm install react-native-video
```

### Hook & Component (`LivePlayer.tsx`)
```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const API_BASE = 'http://10.0.2.2:8080'; // 10.0.2.2 for Android emulator

export default function StreamingApp() {
  const [matches, setMatches] = useState<any[]>([]);
  const [activeStream, setActiveStream] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/sports/live?genre=Football`)
      .then(res => res.json())
      .then(json => setMatches(json.data || []))
      .catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      {activeStream && (
        <Video
          source={{ uri: activeStream, type: 'm3u8' }}
          style={styles.player}
          controls
          resizeMode="contain"
        />
      )}

      <Text style={styles.header}>🔴 Live Football Matches</Text>
      <FlatList
        data={matches}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => setActiveStream(item.play_url)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>▶ Tap to stream live</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#10b981', marginVertical: 12 },
  player: { width: '100%', height: 220, backgroundColor: '#000', borderRadius: 8 },
  card: { backgroundColor: '#111827', padding: 14, borderRadius: 8, marginVertical: 6 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sub: { color: '#10b981', fontSize: 12, marginTop: 4 },
});
```

---

## 3. Android Kotlin / Jetpack Compose Integration

### Media3 ExoPlayer Setup
```kotlin
val context = LocalContext.current
val exoPlayer = remember {
    ExoPlayer.Builder(context).build().apply {
        val mediaItem = MediaItem.Builder()
            .setUri(playUrl)
            .setMimeType(MimeTypes.APPLICATION_M3U8)
            .build()
        setMediaItem(mediaItem)
        prepare()
        playWhenReady = true
    }
}

AndroidView(
    factory = { ctx ->
        PlayerView(ctx).apply {
            player = exoPlayer
            useController = true
        }
    },
    modifier = Modifier.fillMaxWidth().aspectRatio(16f / 9f)
)
```

---

## 4. Playing DASH Streams with ClearKey DRM (Azam Sports, Bein, TNT)

For channels using MPEG-DASH (`format: "DASH"`), the API provides pre-parsed ClearKey parameters (`drm.key_id`, `drm.key`, `drm.shaka_keys`).

### Flutter (with `better_player`)
```dart
import 'package:better_player/better_player.dart';

BetterPlayerDataSource dataSource = BetterPlayerDataSource(
  BetterPlayerDataSourceType.network,
  channel.playUrl, // https://<YOUR_API>/api/v1/stream/tulo/CH-0007.mpd
  videoFormat: BetterPlayerVideoFormat.dash,
  drmConfiguration: BetterPlayerDrmConfiguration(
    drmType: BetterPlayerDrmType.clearKey,
    clearKey: {
      channel.drm['key_id']: channel.drm['key'],
    },
  ),
);

BetterPlayerController controller = BetterPlayerController(
  BetterPlayerConfiguration(autoPlay: true),
  betterPlayerDataSource: dataSource,
);
```

### Web Player (Shaka Player)
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.11/shaka-player.compiled.js"></script>

<video id="video" width="100%" controls autoplay></video>

<script>
async function playChannel(playUrl, shakaKeys) {
  const video = document.getElementById('video');
  const player = new shaka.Player(video);

  if (shakaKeys) {
    player.configure({
      drm: {
        clearKeys: shakaKeys // e.g. {"c31df1600afc33799ecac543331803f2": "dd2101530e222f545997d4c553787f85"}
      }
    });
  }

  await player.load(playUrl);
}
</script>
```
