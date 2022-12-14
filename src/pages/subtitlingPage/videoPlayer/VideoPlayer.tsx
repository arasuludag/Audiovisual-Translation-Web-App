import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setActiveSubtitle } from "../../../slices/subtitleSlice";

import "./videoPlayer.css";

import { selectVideoTime } from "../../../slices/videoSlice";
import { Grid } from "@mui/material";
import Subtitle from "./Subtitle";
import Settings from "../settings/Settings";
import VideoControl from "./controlGroup/VideoControl";
import ThemeSelection from "../settings/ThemeSelection";

// @ts-ignore
import video from "./video.mp4"; // Will be fetched from the backend on the real thing.

function VideoPlayer(): JSX.Element {
  const dispatch = useAppDispatch();
  const videoTime = useAppSelector(selectVideoTime);

  const player = useRef<HTMLVideoElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  // Set video time if VideoTime updates.
  useEffect(() => {
    if (player.current) player.current.currentTime = videoTime.seconds;
  }, [player, videoTime]);

  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    // Updates when video is progressing.
    player.current?.addEventListener("timeupdate", () => {
      setCurrentTime(Math.round(player.current!.currentTime * 1000));
    });
  }, []);

  useEffect(() => {
    dispatch(setActiveSubtitle(currentTime));
  }, [currentTime, dispatch]);

  // Forward or backward time.
  function onSeek(direction: boolean, howMuch: number) {
    if (player.current) {
      direction
        ? (player.current.currentTime += howMuch)
        : (player.current.currentTime -= howMuch);
    }
  }

  return (
    <div
      ref={divRef}
      className="container"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Grid
        container
        sx={{
          position: "absolute",
          top: 10,
          zIndex: 3,
          left: 0,
          width: "fit-content",
          margin: 1,
        }}
      >
        <Settings />
        <ThemeSelection />
      </Grid>
      <VideoControl
        currentTime={currentTime}
        onSeek={(direction, howMuch) => onSeek(direction, howMuch)}
      />
      <video
        src={video}
        ref={player}
        className="video"
        controls
        controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
        disablePictureInPicture
      ></video>
      <Subtitle playerHeight={player.current?.offsetHeight || 400} />
    </div>
  );
}

export default VideoPlayer;
