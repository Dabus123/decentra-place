import React, { useState, useEffect, useCallback } from 'react';
import { useContract, useContractRead, useContractEvents, useAddress } from "@thirdweb-dev/react";
import './Canvas.css';
import { motion } from "framer-motion";
import { myNFTABI } from '@/myNFT';
import { abi } from './nftabi';
import { parseEther } from 'viem';
import { FaEthereum } from 'react-icons/fa';
import { useWriteContract } from 'wagmi';

const CONTRACT_ADDRESS = "0x2640A3eE3F7d7d5F766808dA8cA6a369d41bAc5D"; // Replace with your contract address

export default function CustomPixelByNumberBig({ filterNumbers, id }) {
  const { contract } = useContract(CONTRACT_ADDRESS, myNFTABI);
  const address = useAddress();
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 1, y: 1 });
  const [hoveredPixel, setHoveredPixel] = useState({ x: null, y: null });
  const [clickedPixel, setClickedPixel] = useState({ x: null, y: null });
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const { data: burned, isLoading: burnedLoad } = useContractRead(contract, "gridSizes", [id]);
  const { data: grid, isLoading: gridLoad } = useContractRead(contract, "gridCompleted", [id]);
  const { data: price, isLoading: priceLoad } = useContractRead(contract, "gridNFTPrice", [id]);
  const { data: supply, isLoading: supplyLoad } = useContractRead(contract, "gridNFTSupply", [id]);
  const [pixelColors, setPixelColors] = useState(Array(1).fill(0)); // default to an array with one element
  const [WINDOW_SIZE, setWindowSize] = useState(0); // initial state set to 0
  const [isComplete, setIsComplet] = useState(false);
  const [gridprice, setPrice] = useState(0); // initial state set to 0
  const [gridsupply, setSupply] = useState(0); // initial state set to 0
  const [canvasLoaded, setCanvasLoaded] = useState(false); 
  const { writeContract } = useWriteContract();
  

  useEffect(() => {
    if (grid) {
      setIsComplet(grid);
    }
  }, [grid]);

  useEffect(() => {
    if (price) {
      setPrice(price);
    }
  }, [price]);

  useEffect(() => {
    if (supply) {
      setSupply(supply);
    }
  }, [supply]);

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
    const containerWidth = 300; // Set this to the maximum width of the container or the screen size
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
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }} className="canvas-container">
      <div className="pixel-canvas">
      <div>
          {/* Check if burned value is greater than 101 */}
          {burned > 101 && !canvasLoaded ? (
            <div>
              
              <p style={{fontWeight:'bold'}}>This canvas may take a little longer to load.</p>
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-900 transition"
                style={{ minWidth: 'fit-content', padding: '3px' }}
                onClick={() => setCanvasLoaded(true)} // Set canvasLoaded to true when button is clicked
              >
                Load Canvas
              </button>
            </div>
          ) : (
            <div>
              {burned < 1 ? (
                <p  style={{color:'#000', fontWeight:'bold'}}>Not started</p>
              ) : (
                <div>{renderCanvas()}</div>
              )}
            </div>
          )}
        </div>
        {!isComplete ? <div><p style={{backgroundColor:'#000'}}>mint did not start yet</p></div>:
        
        <div>
           <button 
      className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-900 transition"
      style={{ minWidth: 'fit-content',padding:'3px' }}
      onClick={() => 
        writeContract({ 
          abi,
          address: '0xA7cfe7a1EB138940e95B96Fda00aba7b17982089',
          functionName: 'mintGridNFTs',
          args: [String(id)],
          value: String(gridprice),
        })
      }
    >
      
      {gridprice == 0 ? <p>NFT not finished</p>:
      <div>
      <p style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 'max-content' }} className="text-white shadow-lg">
       <p style={{ display: 'flex', flexDirection: 'row', padding:'0px'}}>MINT FOR</p>  
        <h2>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
           {(String(gridprice))/1000000000000000000}<FaEthereum />
          </div>
        </h2>
         </p>
               <div className='supply' style={{display:'flex', flexDirection:'column', marginLeft:'6px'}}>
               <h2>NFTs left: {String(gridsupply)}</h2>
             </div>
             </div>
        }
     
      
    </button>
    
          </div>
          
          }
      </div>
    </div>
  );
}
