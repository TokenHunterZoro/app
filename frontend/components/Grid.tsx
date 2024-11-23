"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Music2,
  Sword,
  Volume2,
  VolumeX,
} from "lucide-react";

type MusicInfo = {
  id?: string;
  title: string;
  play?: string;
  cover?: string;
  author?: string;
  original?: boolean;
  duration?: number;
  album?: string;
};

type TikTokVideo = {
  aweme_id: string;
  video_id: string;
  region: string;
  title: string;
  cover: string;
  duration: number;
  play: string;
  play_count: number;
  digg_count: number;
  comment_count: number;
  share_count: number;
  download_count: number;
  music_info: MusicInfo;
};

type Props = {
  videos: TikTokVideo[];
};

const TikTokVideoGrid = ({ videos = [] }: Props) => {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState<boolean>(true);

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = (videoId: string) => {
    if (playingVideo === videoId) {
      setPlayingVideo(null);
    } else {
      setPlayingVideo(videoId);
    }
  };

  const handleLike = (videoId: string) => {
    setLikedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleShare = async (video: TikTokVideo) => {
    try {
      await navigator.share({
        title: video.title || "TikTok Video",
        text: `Check out this TikTok video!`,
        url: video.play,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const handleDownload = async (video: TikTokVideo) => {
    try {
      const response = await fetch(video.play);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tiktok-${video.video_id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log("Error downloading:", error);
    }
  };

  if (!videos?.length) {
    return (
      <div className="container mx-auto p-4 text-center text-gray-500">
        No videos available
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sword className="w-8 h-8 text-green-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
            Zoro
          </h1>
          <Sword className="w-8 h-8 text-green-500 animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground mb-2">
          TikTok Memecoin Hunter
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Top Hunter
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Trending
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card
            key={video.aweme_id}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader className="relative p-0">
              <div className="relative aspect-video">
                {playingVideo === video.video_id ? (
                  <video
                    src={video.play}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted={muted}
                    playsInline
                  />
                ) : (
                  <img
                    src={video.cover}
                    alt={video.title || "TikTok video"}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button
                    onClick={() => setMuted(!muted)}
                    className="bg-black bg-opacity-60 p-1 rounded text-white hover:bg-opacity-80"
                  >
                    {muted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <div className="bg-black bg-opacity-60 px-2 py-1 rounded text-white text-sm">
                    {formatDuration(video.duration)}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white"
                >
                  {video.region}
                </Badge>
                {video.music_info && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Music2 className="w-4 h-4 mr-1" />
                    <span className="truncate">{video.music_info.title}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {video.title || "No caption"}
              </p>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <div className="flex justify-between w-full text-sm">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handlePlayPause(video.video_id)}
                    className="flex items-center hover:text-green-500 transition-colors"
                  >
                    {playingVideo === video.video_id ? (
                      <Pause className="w-4 h-4 mr-1" />
                    ) : (
                      <Play className="w-4 h-4 mr-1" />
                    )}
                    <span>{formatCount(video.play_count)}</span>
                  </button>
                  <button
                    onClick={() => handleLike(video.video_id)}
                    className={`flex items-center transition-colors ${
                      likedVideos.has(video.video_id)
                        ? "text-red-500"
                        : "hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className="w-4 h-4 mr-1"
                      fill={
                        likedVideos.has(video.video_id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                    <span>{formatCount(video.digg_count)}</span>
                  </button>
                  <div className="flex items-center hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span>{formatCount(video.comment_count)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleShare(video)}
                    className="hover:text-green-500 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(video)}
                    className="hover:text-green-500 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TikTokVideoGrid;
