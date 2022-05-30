import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Button from '@mui/material/Button';
import { Container } from '@mui/system';
import Stack from '@mui/material/Stack';
import { Card, CardActions, CardContent, CardMedia, TextField, Typography } from '@mui/material';
import { ScreenShotCard } from './ScreenShotCard';

type OcrData = {
  imageBlob: Blob,
  createdAt: number,
};

function App() {
  const [imagesMap, addImagesMap] = useState(new Map<string, OcrData>());
  const [isReadingBuffer, setIsReadBuffer] = useState(-1);

  const map2array = (images: Map<string, OcrData>) => {
    return Array.from(images.values());
  };

  const readClipBoard = () => {
    navigator.clipboard.read()
      .then((data: ClipboardItem[]) => {
        return data.find(x => x.types.some(x => x == 'image/png'));
      })
      .then(async (item: ClipboardItem | undefined) => {
        if (item) {
          return item.getType('image/png');
        }
        return undefined;
      })
      .then(async (imageBlob: Blob | undefined) => {
        if (imageBlob) {
          const imageBuffer = await imageBlob.arrayBuffer();
          const keyBuffer = await crypto.subtle.digest("SHA-1", imageBuffer);
          const enc = new TextDecoder("utf-8");
          const key: string = enc.decode(keyBuffer);
          if (imagesMap.has(key)) {
            return;
          }          
          
          imagesMap.set(key, {
            imageBlob,
            createdAt: Date.now(),
          });
          addImagesMap(new Map(imagesMap));
        }
      });
  }

  const readFromClipBoardJob = () => {
    if (isReadingBuffer === -1) {
      setIsReadBuffer(window.setInterval(readClipBoard, 1000));
    } else {
      window.clearInterval(isReadingBuffer);
      setIsReadBuffer(-1);
    }
  }

  return (
    <div className="App">
      <Container fixed>
        <Button variant="contained" onClick={readFromClipBoardJob} color={isReadingBuffer != -1 ? "error" : "success"}>{isReadingBuffer != -1 ? "Stop" : "Start"}</Button>
        <Stack spacing={2}>
          {map2array(imagesMap).map(data => {
            return (
              <ScreenShotCard imageBlob={data.imageBlob} key={data.createdAt} />
            )
          })}
        </Stack>
      </Container>
    </div>
  );
}

export default App;
