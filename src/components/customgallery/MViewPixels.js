import React, { useState, useEffect, useCallback } from 'react';
import { useContract, useContractRead, useContractEvents, useAddress } from "@thirdweb-dev/react";
import './Canvas.css';
import { motion } from "framer-motion";
import { myNFTABI } from '@/myNFT';

const CONTRACT_ADDRESS = "0x2640A3eE3F7d7d5F766808dA8cA6a369d41bAc5D"; // Replace with your contract address

export default function CustomPixelByNumber({ filterNumbers, id }) {
  const { contract } = useContract(CONTRACT_ADDRESS, myNFTABI);
  const address = useAddress();
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 1, y: 1 });
  const [hoveredPixel, setHoveredPixel] = useState({ x: null, y: null });
  const [clickedPixel, setClickedPixel] = useState({ x: null, y: null });
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  
  // Make sure id is defined before using it
  const { data: burned, isLoading: burnedLoad } = useContractRead(contract, "gridSizes", [id]);
  const [pixelColors, setPixelColors] = useState(Array(1).fill(0)); // default to an array with one element
  const [WINDOW_SIZE, setWindowSize] = useState(0); // initial state set to 0

  useEffect(() => {
    if (burned) {
      setWindowSize(burned);
      setPixelColors(Array(burned * burned).fill(0)); // initialize with the correct size
    }
  }, [burned]);

  const { data: pixelChangedEvents = [] } = useContractEvents(contract, "CustomPixelChanged", {
    queryFilter: {
      fromBlock: 3912450,
      toBlock: 'latest',
      order: "asc",
    },
    subscribe: true,
  });

  useEffect(() => {
    const newPixelColors = Array(WINDOW_SIZE * WINDOW_SIZE).fill(0);

    for (const event of pixelChangedEvents) {
      const { x, y, color, id } = event.data;
      const relativeX = x - windowPosition.x;
      const relativeY = y - windowPosition.y;

      // Filter based on provided filterNumbers
      if (relativeX >= 0 && relativeX < WINDOW_SIZE && relativeY >= 0 && relativeY < WINDOW_SIZE && 
          id && filterNumbers.includes(id.toNumber())) {
        const pixelIndex = relativeY * WINDOW_SIZE + relativeX;
        newPixelColors[pixelIndex] = color;
      }
    }

    setPixelColors(newPixelColors);
  }, [pixelChangedEvents, windowPosition, WINDOW_SIZE, filterNumbers]);

  const decimalToHex = (decimalColor) => {
    return "#" + (decimalColor & 0x00FFFFFF).toString(16).padStart(6, '0');
  };

  const handlePixelClick = useCallback((x, y) => {
    if (isUserRegistered) {
      setClickedPixel({ x, y });
    }
  }, [isUserRegistered]);

 
  const renderCanvas = () => {
    const canvas = [];
    const containerWidth = 100; // Set this to the maximum width of the container or the screen size
    const adjustedPixelSize = Math.floor(containerWidth / WINDOW_SIZE); // Dynamically calculate pixel size based on window size

    for (let y = 1; y <= WINDOW_SIZE; y++) {
        const row = [];
        for (let x = 1; x <= WINDOW_SIZE; x++) {
            const pixelIndex = (y - 1) * WINDOW_SIZE + (x - 1);
            const posX = windowPosition.x + x - 1;
            const posY = windowPosition.y + y - 1;
            const decimalColor = pixelColors[pixelIndex];
            const color = decimalToHex(decimalColor);

            const pixelStyle = {
                width: `${adjustedPixelSize}px`,
                height: `${adjustedPixelSize}px`,
                backgroundColor: color,
            };

            row.push(
                <motion.div
                    key={`${pixelIndex}-${decimalColor}`}
                    className="pixelOnchain"
                    style={pixelStyle}
                    onMouseEnter={() => handlePixelHover(posX, posY)}
                    onClick={() => handlePixelClick(posX, posY)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            );
        }
        canvas.push(<div key={y} className="row">{row}</div>);
    }

    return <div className="canvas">{canvas}</div>;
};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'baseline', alignItems: 'flex-end' }} className="canvas-container">
     <div className="pixel-canvases">
      <div className="pixel-canvas">
      {burned < 1 ? <p style={{color:'#000', fontWeight:'bold'}}>not started</p>:
      <div>
       {burned > 101 ? <p> exceeds display limits </p>:
      <div>  {renderCanvas()} </div>}
      </div>
      }
      </div>
      </div>
    </div>
  );
}
