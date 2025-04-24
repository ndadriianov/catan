import {useEffect} from "react";

const images = [
  'assets/map/clay.png',
  'assets/map/forrest.png',
  'assets/map/frame.png',
  'assets/map/sheeps.png',
  'assets/map/stone.png',
  'assets/map/wasteland.png',
  'assets/map/wheat.png'
];

export const PreloadAssets = () => {
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return null;
};