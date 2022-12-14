import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";

import {
  insertToSubtitle,
  selectActiveSubtitle,
  selectSubtitleToScrollInto,
  Subtitle,
} from "../../../../slices/subtitleSlice";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { CardActions, Stack } from "@mui/material";

import ChractersPerLine from "./ChractersPerLine";
import TopToolbar from "./TopToolbar";
import BottomToolbar from "./bottomToolbar/BottomToolbar";
import AddBox from "./bottomToolbar/AddBox";

// @ts-ignore
import h2p from "html2plaintext";

interface ChildComponentProps {
  subtitle: Subtitle;
  readOnly: boolean;
}

function SubtitleBox(props: ChildComponentProps) {
  const dispatch = useAppDispatch();
  const activeSubtitle = useAppSelector(selectActiveSubtitle);
  const subtitleToScrollInto = useAppSelector(selectSubtitleToScrollInto);

  const [text, setText] = useState(props.subtitle.text);
  const [time, setTime] = useState({
    start: props.subtitle.start_time,
    end: props.subtitle.end_time,
  }); // For the "Goto button" and other componenents that need updated time.

  const [raised, setRaised] = useState(false);

  const subtitleBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      activeSubtitle.id === props.subtitle.id &&
      ((!activeSubtitle.isWorkingOn && props.readOnly) ||
        (activeSubtitle.isWorkingOn && !props.readOnly))
    ) {
      setRaised(true);

      if (activeSubtitle.tracked)
        subtitleBoxRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    } else setRaised(false);
  }, [activeSubtitle, props.readOnly, props.subtitle.id]);

  useEffect(() => {
    if (
      subtitleToScrollInto.subtitle.id === props.subtitle.id &&
      ((!subtitleToScrollInto.subtitle.isWorkingOn && props.readOnly) ||
        (subtitleToScrollInto.subtitle.isWorkingOn && !props.readOnly))
    )
      subtitleBoxRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }, [
    props.readOnly,
    props.subtitle.id,
    subtitleToScrollInto.subtitle.id,
    subtitleToScrollInto.subtitle.isWorkingOn,
    subtitleToScrollInto.version,
  ]);

  const optimizedTopToolbar = useMemo(
    () => (
      <TopToolbar
        readOnly={props.readOnly}
        id={props.subtitle.id}
        time={time}
        setTime={(timeRecieved) => setTime({ ...time, ...timeRecieved })}
      />
    ),
    [props.subtitle.id, props.readOnly, time]
  );

  const optimizedEditor = useMemo(
    () => (
      <Stack direction="row">
        <ReactQuill
          theme="bubble"
          className="editor"
          value={text}
          onChange={(value) => {
            dispatch(
              insertToSubtitle({
                subtitle: {
                  text: value,
                },
                id: props.subtitle.id,
              })
            );
            setText(value);
          }}
          readOnly={props.readOnly}
          modules={{
            toolbar: [["bold", "italic", "underline"], ["clean"]],
          }}
          formats={["bold", "italic", "underline"]}
        />
        <ChractersPerLine text={h2p(text)} />
      </Stack>
    ),
    [dispatch, text, props.readOnly, props.subtitle.id]
  );

  const optimizedBottomToolbar = useMemo(
    () => (
      <BottomToolbar
        subtitle={props.subtitle}
        time={time}
        text={h2p(text)}
        readOnly={props.readOnly}
      />
    ),
    [props.readOnly, props.subtitle, time, text]
  );

  return (
    <Card
      ref={subtitleBoxRef}
      raised={raised}
      sx={{
        height: 200,
        width: { sx: "100wv", md: 425, xl: 500 },
        margin: "10px 5px",
        borderRadius: 5,
        opacity: props.subtitle.deleted ? 0.2 : 1,
      }}
    >
      {props.subtitle.deleted ? (
        props.readOnly ? null : (
          <AddBox
            id={props.subtitle.id}
            end_time={time.end}
            isInsertedBelow={false}
          />
        )
      ) : (
        <CardContent>
          {optimizedTopToolbar}
          {optimizedEditor}
          <CardActions>{optimizedBottomToolbar}</CardActions>
        </CardContent>
      )}
    </Card>
  );
}

export default SubtitleBox;
