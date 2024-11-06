import React, { useState, useEffect, useCallback } from 'react';
import { useContract, useContractRead, useContractEvents, useAddress } from "@thirdweb-dev/react";
import './Canvas.css';
import { motion } from "framer-motion";
import { myNFTABI } from '@/myNFT';
import abi from './nftabi';

const CONTRACT_ADDRESS = "0x2640A3eE3F7d7d5F766808dA8cA6a369d41bAc5D"; // Replace with your contract address

export default function ViewPixelByNumberBig({ filterNumbers }) {
  const { contract } = useContract(CONTRACT_ADDRESS, myNFTABI);
  const address = useAddress();
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 1, y: 1 });
  const [hoveredPixel, setHoveredPixel] = useState({ x: null, y: null });
  const [clickedPixel, setClickedPixel] = useState({ x: null, y: null });
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const WINDOW_SIZE = 100;
  const [pixelColors, setPixelColors] = useState(Array(WINDOW_SIZE * WINDOW_SIZE).fill(0));
  const { data: burned, isLoading: burnedLoad } = useContractRead(contract, "nextId");
  const [State, setState] = useState(false); // initial state set to 0
  const [isCurrent, setIsCurrent] = useState(false); // initial state set to 0

  useEffect(() => {
    if (filterNumbers<burned) {
      setState(true);
    }
  }, [burned]);

  useEffect(() => {
    const filterNumberValue = Number(filterNumbers);
    const burnedValue = Number(burned);
    if (filterNumberValue === burnedValue) {
      setIsCurrent(true);
  } else {
      setIsCurrent(false);
  }
  }, [burned]);

  const { data: pixelChangedEvents = [] } = useContractEvents(contract, "PixelChanged", {
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
    const adjustedPixelSize = Math.min(150, 150 / 40);

    for (let y = 1; y <= WINDOW_SIZE; y++) {
      const row = [];
      for (let x = 1; x <= WINDOW_SIZE; x++) {
        const pixelIndex = (y - 1) * WINDOW_SIZE + (x - 1);
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
            className="pixelGalleryBig"
            style={pixelStyle}
            onMouseEnter={() => setHoveredPixel({ x, y })}
            onClick={() => handlePixelClick(x, y)}
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
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', marginBottom:'80px' }} className="canvas-container">
      <div className="pixel-canvas">
     {!isCurrent ? <div><p>not started</p></div>:
       <div><p style={{color:'#000', fontWeight:'bold'}}>LIVE</p>{renderCanvas()}</div>
      }
     {!State ? <div><p style={{backgroundColor:'#000'}}>mint did not start yet</p></div>:
           <div>
           <button 
      className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-900 transition"
      style={{ minWidth: 'fit-content',padding:'3px' }}
      onClick={() => 
        writeContract({ 
          abi,
          address: '0x8b75509368c57C3866A32D2bf6b7857bb499519F',
          functionName: 'mintGridNFTs',
          args: [String(id)],
        })
      }
    >
      <p style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 'max-content' }} className="text-white shadow-lg">
       <p style={{ display: 'flex', flexDirection: 'row', padding:'0px'}}>MINT FOR FREE</p>  
       
      </p>
    </button>
          <div className='supply' style={{display:'flex', flexDirection:'column', marginLeft:'6px'}}>
            <h2>NFTs left: {String(gridsupply)}</h2>
          </div>
          </div>
     
     }
      </div>
    </div>
  );
}
