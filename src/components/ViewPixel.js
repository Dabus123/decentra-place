import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useContract, useContractRead, useContractEvents, useAddress } from "@thirdweb-dev/react";
import './Canvas.css';
import { motion } from "framer-motion";
import { myNFTABI } from '@/myNFT';

const CONTRACT_ADDRESS = "0x2640A3eE3F7d7d5F766808dA8cA6a369d41bAc5D";
const WINDOW_SIZE = 100;

export default function ViewPixel() {
  const { contract } = useContract(CONTRACT_ADDRESS, myNFTABI);
  const address = useAddress();
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 1, y: 1 });
  const [hoveredPixel, setHoveredPixel] = useState({ x: null, y: null });
  const [clickedPixel, setClickedPixel] = useState({ x: null, y: null });
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const { data: grid, isLoading: gridLoad } = useContractRead(contract, "nextId");
  const { data: burned, isLoading: burnedLoad } = useContractRead(contract, "coloredId");
  const [pixelColors, setPixelColors] = useState(new Map());

  // Fetch pixel changed events and subscribe to them
  const { data: pixelChangedEvents = [] } = useContractEvents(contract, "PixelChanged", {
    queryFilter: {
      fromBlock: 3912450,
      toBlock: 'latest',
      order: "asc",
    },
    subscribe: true,
  });

  // Function to convert decimal color to hex
  const decimalToHex = useCallback((decimalColor) => {
    return "#" + (decimalColor & 0x00FFFFFF).toString(16).padStart(6, '0');
  }, []);

  // Process pixel change events
  useEffect(() => {
    const newPixelColors = new Map(pixelColors);  // Clone current pixel colors

    pixelChangedEvents.forEach((event) => {
      const { x, y, color, id } = event.data;
      if (id?.toNumber() === grid?.toNumber()) {
        newPixelColors.set(`${x},${y}`, color);
      }
    });
    
    setPixelColors(newPixelColors);
  }, [pixelChangedEvents, grid]);

  // Memoized event handlers for pixel hover and click
  const handlePixelClick = useCallback((x, y) => {
    if (isUserRegistered) {
      setClickedPixel({ x, y });
    }
  }, [isUserRegistered]);

  const handlePixelHover = useCallback((x, y) => {
    setHoveredPixel({ x, y });
  }, []);

  // Memoized canvas render function
  const renderCanvas = useMemo(() => {
    const canvas = [];
    const adjustedPixelSize = Math.min(150, 150 / 40); // Adjust pixel size dynamically

    for (let y = 1; y <= WINDOW_SIZE; y++) {
      const row = [];
      for (let x = 1; x <= WINDOW_SIZE; x++) {
        const posX = windowPosition.x + x - 1;
        const posY = windowPosition.y + y - 1;
        const pixelKey = `${posX},${posY}`;
        const decimalColor = pixelColors.get(pixelKey) || 0;
        const color = decimalToHex(decimalColor);

        row.push(
          <MemoizedPixel
            key={pixelKey}
            color={color}
            posX={posX}
            posY={posY}
            pixelSize={adjustedPixelSize}
            onHover={handlePixelHover}
            onClick={handlePixelClick}
          />
        );
      }
      canvas.push(<div key={y} className="row">{row}</div>);
    }

    return <div className="canvas">{canvas}</div>;
  }, [pixelColors, windowPosition, decimalToHex, handlePixelHover, handlePixelClick]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }} className="canvas-container">
      <div className="pixel-canvas">
        {renderCanvas}
      </div>
    </div>
  );
}

// Memoized Pixel component to prevent re-renders unless props change
const MemoizedPixel = React.memo(({ color, posX, posY, pixelSize, onHover, onClick }) => (
  <motion.div
    className="pixelOnchain"
    style={{ width: `${pixelSize}px`, height: `${pixelSize}px`, backgroundColor: color }}
    onMouseEnter={() => onHover(posX, posY)}
    onClick={() => onClick(posX, posY)}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  />
));
