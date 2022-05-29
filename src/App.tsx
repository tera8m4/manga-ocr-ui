import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Button from '@mui/material/Button';
import { Container } from '@mui/system';
import Stack from '@mui/material/Stack';


const no_image = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPMAAAB7CAIAAAAudyHdAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAATwSURBVHhe7dkxduI6GIZhM2sJU+RkBWQFMM1UWQKUkwWkTHcbKEN326luBSuYrCCHImQvXMmWbNlIYDsmyXznfZrBsizLP5+FnRkdDocMkPPN/QtoIdnQRLKhiWRDE8mGJpINTSQbmkg2NJFsaCLZ0ESyoYlkQxPJhiaSDU0kG5pINjSRbGgi2dBEsqGJZEMTyYYmkg1NJBuaSDY0kWxoItnQRLKhiWRDE8mGJpINTSQbmkg2NJFsaCLZ0ESyoYlkQxPJhiaSDU0kG5pINjSRbGgi2dBEsqGJZEMTyYYmkg1NJBuaSDY0kWxoItnQRLKh6SOSvV2MRout22jDHHC7enMbvb2tbkdWv6GGmcNX0fErsKXr9I11dvnydku2LVDgxMXbnoNOvXOxt//cP883h8Phz6+rgeYz+EW1N+CpP/EqPlLnNXuy3Ju0FJ6mrvHY9MlF6jNNrsfu0zDz+cSLGvDUX+Krubwhnkb8z75Rrqp2YYgvsUHvsEfVfLt6dW2e3Te+f87Ws3x3sdwkxsnZfbN19nw/9juD+didi61tyAXL16k5WPVBzIHlIKa1PDg6oD/OKA8qBLPyqr6lVvMvRc/rpa+iMVS0PTHPyBnN4berVTFG3lb1iZd3YG75bWczr63Zuc3cN+2Xk3K36ZnlzwInPgf9m4cen8b28AcWW7Vxgn1Ofa7BefPufl+j/fQcjgYpNorPwUY5th+h1ug/2UY3Wjhy2LlydOpquPJAz7b5Adwcwm6pofKNYsfJdj9OsJG60rIqRrCn2OU3LqRzsgPlpD07edcYL2V4dZbZk28GB1q+OVTr0ugfPaDeVs2hcXDZrcUcUoPUNoJOlbJH2LV26vBkkXOnTh3pG5tA2JYcqhor0d5orvoHqj7hOdOnupj3PGe7x+zqR8Y+MZxVPCIUzBNDbr9rcWCg2X98PXne7d1GT13n0EKkMlffb7KX1/zHffvfOrv57p93Y2XpLXjB6ChVxrw9XfbzGbhAeU9793P2djG+v3H3or0vzwpveiN/lzElcnvbafY3Zev/ZTpd53BWtDJvry8+xLP1fFO9g8fK0lv/2zxVxrw9VfY2GRi8vOcM8Qbp2b+zuY8JVz/uJuvH41ceu5L5dnP7p9Yst9i5cWb+VeVt9bie3P1459t+yzn0UlXGhKHKsM91qiz9TH/OywsxoYu9YYbWM9ejUcZIe4uyJzNwyfJGvTvZ06fNPP+bxWj0eL00j1YnXf36s7/7Xf3u+tfu6dN+mRVL2Xj3ELvvbVXzxS4/woxTnnY0/n23H+DPWOfn0E20MqYxc9O23OWnytJPcCHmzP+eqcx887ArLtqsu1UZJ8uNm1HQnih7qwwMXd5zRmbpcB9xeWa1Cu/D7cJEYYi7sic7nd3Dqf+X+HsN+TSCs+x7VPXWaB+6cSEk+0PZn+SX8mlkoMcoxPA0Ak2s2dBEsqGJZEMTyYYmkg1NJBuaSDY0kWxoItnQRLKhiWRDE8mGJpINTSQbmkg2NJFsaCLZ0ESyoYlkQxPJhiaSDU0kG5pINjSRbGgi2dBEsqGJZEMTyYYmkg1NJBuaSDY0kWxoItnQRLKhiWRDE8mGJpINTSQbmkg2NJFsaCLZ0ESyoYlkQxPJhiaSDU0kG5pINjSRbGgi2dBEsqGJZEMTyYYmkg1NJBuaSDY0kWxoItlQlGX/A2sXSomwyvb3AAAAAElFTkSuQmCC`;


type OcrData = {
  imageBlob: Blob,
  createdAt: number,
  text: string,
};

const blobToBase64 = (blob: Blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise(resolve => {
    reader.onloadend = () => {
      resolve(reader.result);
    };
  });
};




function App() {

  let timerHandler: number = -1;

  const [imageUrl, setImage] = useState('no');
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
          const imageBase64 = await blobToBase64(imageBlob);
          console.log(imageBase64);
          const ocrResult = await fetch('http://127.0.0.1:5000/decode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({data: imageBase64}),
          }).then(res => res.text())
          imagesMap.set(key, {
            imageBlob,
            createdAt: Date.now(),
            text: ocrResult,
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
              <div key={data.createdAt}>
                <img src={URL.createObjectURL(data.imageBlob)} />
                <p>{data.text}</p>
              </div>)
          })}
        </Stack>
      </Container>
    </div>
  );
}

export default App;
