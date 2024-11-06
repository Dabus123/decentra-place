import { useAccount } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { useRef, useMemo, useState, useEffect } from "react";
import { myNFTABI, myNFTAddress } from '@/myNFT';
import { HexColorPicker  } from 'react-colorful';
import { BigNumber, ethers } from 'ethers';
import { useWriteContract ,useReadContract} from 'wagmi'
import { FaEthereum, FaUnlock, FaEraser, FaPaintBrush } from "react-icons/fa";
import { parseEther } from "viem";
import { FaSave } from "react-icons/fa";
import {abi} from './abi';
import { config } from "./config";
import './Canvas.css'; // Import your CSS stylesheet
import { type UseAccountReturnType } from 'wagmi'
import { getAccount } from '@wagmi/core'
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { ChangeEvent } from 'react';

const hexToDecimal = (hexColor: string): number => {
  return parseInt(hexColor.replace(/^#/, ''), 16);
};

// Define the type for a transaction
interface Transaction {
    address: typeof myNFTAddress,
    abi: typeof myNFTABI,
    functionName: "customPixel",
  args: (string | number)[];
}



interface UnlockTransaction {
  address: typeof myNFTAddress,
  abi: typeof myNFTABI,
  functionName: "unlockGrid",
args: (string | number)[];
}

interface FinishTransaction {
  address: typeof myNFTAddress,
  abi: typeof myNFTABI,
  functionName: "completeArtwork",
args: (BigNumber | number)[];
}


export function CUpp() {
  const { contract } = useContract(myNFTAddress, myNFTABI);
  const account = useAccount();
  const { address, isConnecting, isDisconnected } = useAccount();
  const { writeContract } = useWriteContract();
    const [id, setId] = useState<string | undefined>(undefined);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [hoveredPixel, setHoveredPixel] = useState<{ x: number, y: number } | null>(null);
    const [clickedPixels, setClickedPixels] = useState<{ x: number, y: number, color: string }[]>([]);
    const [clickedPixel, setClickedPixel] = useState<{ x: number, y: number } | null>(null);
    const [eraserPixels, setEraserClickedPixels] = useState<{ x: number, y: number }[]>([]);
    const [totalPixels, setTotalClickedPixels] = useState<{ x: number, y: number }[]>([]);
    const [unlocktransaction, setUnlockTransactions] = useState<UnlockTransaction[]>([]);
    const [finishtransaction, setFinishTransactions] = useState<FinishTransaction[]>([]);
    const [selectedTool, setSelectedTool] = useState<'circle' | 'square' | 'triangle' | 'line' |'pixel'|'eraser'| null>('pixel');
    const { data: total, isLoading: totalLoad, isError:totalError } = useContractRead(contract, "totalPixels",[address]);
    const { data: grid, isLoading: gridLoad } = useContractRead(contract,"currentGrid",[address]);
    const [gridSize, setGridSize] = useState<number>(4); // Default grid size
    const [artworkPrice, setArtworkPrice] = useState("0"); // Keep this as a string for display
    const [artworkPriceInWei, setArtworkPriceInWei] = useState<bigint>(BigInt(0)); // Use bigint or BigNumber
const [artworkSupply, setArtworkSupply] = useState<number>(1);
    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
const { data: burned, isLoading: burnedLoad } = useContractRead(contract, "currentGridSize",[address]);
const [isCollapsed, setIsCollapsed] = useState(false);

const toggleCollapse = () => {
  setIsCollapsed(!isCollapsed);
};

const apiUrl = process.env.NEXT_PUBLIC_PAYMASTER_SERVICE_URL 


  useEffect(() => {
    if (!burnedLoad && burned) {
      setGridSize(Number(burned)); // Update the grid size based on the contract value
    }
  }, [burned, burnedLoad]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showMessage, setShowMessage] = useState(false);
   


    const containerWidth = 300; // Set this to the maximum width of the container or the screen size
    const adjustedPixelSize = Math.floor(containerWidth / gridSize);

    
    const handleMove = () => {
      // Update state based on touch move
      setShowMessage(true);
    };
  
    const { writeContracts } = useWriteContracts({
      mutation: { onSuccess: (id) => setId(id) },
    });
    


    const { data: availableCapabilities } = useCapabilities({
      account: account.address,
    });
    const capabilities = useMemo(() => {
      if (!availableCapabilities || !account.chainId) return {};
      const capabilitiesForChain = availableCapabilities[account.chainId];
      if (
        capabilitiesForChain["paymasterService"] &&
        capabilitiesForChain["paymasterService"].supported
      ) {
        return {
          paymasterService: {
            url: apiUrl,
          },
        };
      }
      return {};
    }, [availableCapabilities, account.chainId]);
    
    const handlePixelClick = (x: number, y: number) => {
      const colorValue = hexToDecimal(selectedColor);
      if ( x < 1 || y < 1||y>100 || x>100) {
        return;
      }
      const newTransaction: Transaction = {
        address: myNFTAddress,
        abi: myNFTABI,
        functionName: "customPixel",
        args: [x, y, colorValue],
      };
    
      setClickedPixels((prev) => {
        const updatedPixels = prev.filter(pixel => pixel.x !== x || pixel.y !== y);
        return [...updatedPixels, { x, y, color: selectedColor }];
      });
    
      setTransactions((prev) => [
        ...prev.filter(tx => tx.args[0] !== x || tx.args[1] !== y),
        newTransaction
      ]);
    };
    
    



    const handleGridSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const size = parseInt(event.target.value);
      setGridSize(size);
      handleGridSize(size); // Trigger the unlockGrid transaction
    };
  

    const handleGridSize = (size: number) => {
     
      const newUnlockTransaction: UnlockTransaction = {
        address: myNFTAddress, // Type assertion
        abi: myNFTABI, // Ensure this matches your ABI type
        functionName: "unlockGrid",
        args: [size],
      };
    
      setUnlockTransactions((prev) => [
        newUnlockTransaction
      ]);

    };

// Updates the supply or price based on user input
const handleSupplyAndPriceChange = (e: ChangeEvent<HTMLInputElement>, type: "price" | "supply") => {
  const newValue = e.target.value;

  if (type === "supply") {
    setArtworkSupply(parseInt(newValue)); // Ensure it's an integer for supply
  } else if (type === "price") {
    setArtworkPrice(newValue); // Keep it as a string for now
  }
};
;
    


// Function to handle submission
const handleSubmitFinish = async () => {
  try {
    // Convert price to wei
    const priceInWei: BigNumber = ethers.utils.parseEther(artworkPrice);
    const supply: number = parseInt(artworkSupply.toString(), 10);

    // Always set the finish transaction before trying to write it
    handleSupplyAndPrice(priceInWei, supply);

    // Now execute the transaction if there's any
    if (finishtransaction.length > 0) {
      await writeContracts({
        contracts: finishtransaction,
        capabilities,
      });
      setFinishTransactions([]); // Clear transactions after submission
    } else {
      console.warn("No finish transaction to submit.");
    }
  } catch (error) {
    console.error("Error during transaction submission:", error);
  }
};

// Modify handleSupplyAndPrice to accept BigNumber for price and number for supply
const handleSupplyAndPrice = (price: BigNumber, supply: number) => {
  const newFinishTransaction: FinishTransaction = {
    address: myNFTAddress, // Type assertion
    abi: myNFTABI, // Ensure this matches your ABI type
    functionName: "completeArtwork",
    args: [price, supply], // Convert BigNumber to string
  };

  setFinishTransactions((prev) => [
    ...prev,
    newFinishTransaction,
  ]);
};


    const handleSubmit = () => {
      handleSupplyAndPrice;
      if (transactions.length === 0) return;
      writeContracts({
        contracts: transactions,
        capabilities,
      });
      setTransactions([]); // Clear transactions after submission
      setClickedPixels([]); 
    };



    const handleSubmitUnlock = () => {
      if (unlocktransaction.length === 0) return;
      writeContracts({
        contracts: unlocktransaction,
        capabilities,
      });
      setUnlockTransactions([]); // Clear transactions after submission
    };

    
    
    
    
    const drawCanvas = (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
      // Draw all clicked pixels
      clickedPixels.forEach(pixel => {
        ctx.fillStyle = pixel.color;
        ctx.fillRect((pixel.x - 1) * adjustedPixelSize, (pixel.y - 1) * adjustedPixelSize, adjustedPixelSize, adjustedPixelSize);
      });
    
      // Draw hovered pixel for the eraser
      if (selectedTool === 'eraser' && hoveredPixel) {
        ctx.fillStyle = '#000'; // Assuming white as the eraser color
        ctx.fillRect((hoveredPixel.x - 1) * adjustedPixelSize, (hoveredPixel.y - 1) * adjustedPixelSize, adjustedPixelSize, adjustedPixelSize);
      } else if (hoveredPixel) {
        ctx.fillStyle = selectedColor;
        ctx.fillRect((hoveredPixel.x - 1) * adjustedPixelSize, (hoveredPixel.y - 1) * adjustedPixelSize, adjustedPixelSize, adjustedPixelSize);
      }
    };
    
    


  
   
    
      const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const x = Math.floor((e.clientX - rect.left) / adjustedPixelSize); // Adjust for larger pixels
          const y = Math.floor((e.clientY - rect.top) /adjustedPixelSize);
          setHoveredPixel({ x: x + 1, y: y + 1 });
    
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawCanvas(ctx);
          }
        }
      };


 
    

      console.log(address,'Connected Address:')
      console.log(total,'Total Pixels:')

// Function to draw a square using start and end points
const handleSquareTool = (x1: number, y1: number, x2: number, y2: number) => {
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  
  for (let i = 0; i <= width; i++) {
    for (let j = 0; j <= height; j++) {
      handlePixelClick(minX + i, minY + j);
    }
  }
};

// Function to draw a circle with dynamic radius
const handleCircleTool = (x1: number, y1: number, x2: number, y2: number) => {
  const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      if (x * x + y * y <= radius * radius) {
        handlePixelClick(Math.round(x1 + x), Math.round(y1 + y));
      }
    }
  }
};


// Function to draw a line with dynamic orientation
const handleLineTool = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  let x = x1;
  let y = y1;
  while (true) {
    handlePixelClick(x, y);
    if (x === x2 && y === y2) break;
    const e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
};

// Function to draw a triangle using start and end points
const handleTriangleTool = (apexX: number, apexY: number, baseX: number, baseY: number) => {
  const baseWidth = Math.abs(baseX - apexX);
  const baseHeight = Math.abs(baseY - apexY);
  const minX = Math.min(apexX, baseX);
  const minY = Math.min(apexY, baseY);

  // Draw the triangle by filling pixels
  for (let y = minY; y <= minY + baseHeight; y++) {
    // Calculate the width of the triangle at this height
    const widthAtY = baseWidth * (1 - (y - minY) / baseHeight);
    const leftX = Math.round(minX + (baseWidth - widthAtY) / 2);
    const rightX = Math.round(minX + (baseWidth + widthAtY) / 2);

    for (let x = leftX; x <= rightX; x++) {
      handlePixelClick(x, y);
    }
  }
};


// Handle the selected tool
const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / adjustedPixelSize) + 1;
    const y = Math.floor((e.clientY - rect.top) / adjustedPixelSize) + 1;

   
    if (!startPoint) {
      setStartPoint({ x, y });
    } else {
      // Calculate the size and orientation based on start and end points
      switch (selectedTool) {
        case 'square':
          handleSquareTool(startPoint.x, startPoint.y, x, y);
          break;
        case 'circle':
          handleCircleTool(startPoint.x, startPoint.y, x, y);
          break;
        case 'line':
          handleLineTool(startPoint.x, startPoint.y, x, y);
          break;
        case 'triangle':
          handleTriangleTool(startPoint.x, startPoint.y, x, y);
          break;
        case 'pixel':
          handlePixelClick(x, y);
          break;
        default:
          break;
      }

      // Reset the start point
      setStartPoint(null);
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawCanvas(ctx);
    }
  }
  }
;


    
      useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawCanvas(ctx);
          }
        }
      }, [clickedPixels, hoveredPixel, eraserPixels]);


      return (
        <div className="dynamic" >
         
        <div>
        
        <div className="bromiso2">
        {hoveredPixel && (
              <div>
           <p style={{color:'#4e4a70'}} className="mt-2">hovered pixel: X: {hoveredPixel.x}, Y: {hoveredPixel.y}</p>
       
          </div>
       )}
          <HexColorPicker
            color={selectedColor}
            onChange={setSelectedColor}
          />
            
        <div className="tools2"style={{marginTop:'2vh', marginRight:'3vw'}}>
  <button   style={{display:'flex', flexDirection:'column',alignItems:'center',height:'fit-content',width:'2vw', fontSize:'1vh'}} className="bg-green-300 text-black px-4 py-2 rounded hover:bg-red-900 hover:text-white transition w-200" onClick={() => setSelectedTool('square')}>■</button>
  <button   style={{display:'flex', flexDirection:'column',alignItems:'center',height:'fit-content',width:'2vw', fontSize:'1vh'}} className="bg-green-300 text-black px-4 py-2 rounded hover:bg-red-900 hover:text-white transition w-200" onClick={() => setSelectedTool('circle')}>◯</button>
  <button   style={{display:'flex', flexDirection:'column',alignItems:'center',height:'fit-content', width:'2vw', fontSize:'1vh'}} className="bg-green-300 text-black px-4 py-2 rounded hover:bg-red-900 hover:text-white transition w-200" onClick={() => setSelectedTool('line')}>|</button>
  <button   style={{display:'flex', flexDirection:'column',alignItems:'center',height:'fit-content',width:'2vw', fontSize:'1vh'}} className="bg-green-300 text-black px-4 py-2 rounded hover:bg-red-900 hover:text-white transition w-200" onClick={() => setSelectedTool('triangle')}>◿</button>
  <button   style={{display:'flex', flexDirection:'column',alignItems:'center',height:'fit-content',width:'2vw', fontSize:'1vh'}} className="bg-green-300 text-black px-4 py-2 rounded hover:bg-red-900 hover:text-white transition w-200" onClick={() => setSelectedTool('pixel')}>•</button>


</div>
<div  className="buttonsave2">
<h3 style={{fontFamily:'pixel', fontSize:'1rem'}}>SAVE ONCHAIN</h3>
        <button 
          onClick={handleSubmit} 
          className="bg-cyan-300 text-black px-4 py-2 rounded hover:bg-cyan-900 hover:text-white transition w-200"
          style={{width:'fit-content', fontSize:'5vh'}}
        >
        <FaSave/> 
        </button>
        </div>
          </div>
    
      
        </div>
        <div className="buttons2" >
 
        <div className="button-slider">
    


        <button  onClick={handleSubmitFinish}  style={{minWidth:'max-content', height:'fit-content', fontFamily:'pixel'}}  className="bg-cyan-300 text-black rounded hover:bg-cyan-900 hover:text-white transition w-200">
             list NFT </button>
             <div className="artwork-settings-container">
   <h3 style={{fontWeight:'bold', fontFamily:'pixel'}} className="section-heading">Sell your artwork:</h3>
   <div className="input-wrapper">
  <label htmlFor="supply-input" className="input-label">Set Supply:</label>
  <input
     id="supply-input"
     type="number"
     min="1"
     max="10000"
     value={artworkSupply}
     onChange={(e) => handleSupplyAndPriceChange(e, "supply")}
     className="input-field"
     placeholder="e.g. 500"
  />
  <small className="input-helper">Supply range: 1 - 10000</small>
</div>

<div className="input-wrapper">
  <label htmlFor="price-input" className="input-label">Set Price (ETH):</label>
  <input
     id="price-input"
     type="number"
     min="0.0000"
     max="1"
     step="0.00001"
     value={artworkPrice}
     onChange={(e) => handleSupplyAndPriceChange(e, "price")}
     className="input-field"
     placeholder="e.g. 0.05"
  />
  <small className="input-helper">Min: 0.00001 ETH, Max: 1 ETH</small>
</div>

              </div>
   

        </div>
   

    <div style={{height:'max-content', width:'max-content', position:'absolute', right:0, bottom:0}} >
        <canvas
          ref={canvasRef}
          width={adjustedPixelSize * gridSize}
          height={adjustedPixelSize * gridSize}
          className="border border-gray-400 bg-black-200"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />
      </div>
      <div className="dynamicPend2">
     

      <div className="bg-white p-4 rounded-lg shadow-lg text-gray-800" style={{marginTop:'5vh', marginBottom:'160vh'}}>
          <h3 className="text-xl font-semibold mb-2">Selected Pixels:</h3>
          <ul className="list-disc list-inside">
            {clickedPixels.map((pixel, index) => (
              <li key={index}>
                X: {pixel.x}, Y: {pixel.y}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="dynamicPendTwo2">
      <button 
        onClick={toggleCollapse} 
        style={{fontFamily: 'pixel', backgroundColor: '#000', width: 'fit-content', padding: '5px', borderRadius: '7px'}}
      >
        {isCollapsed ? 'open info' : 'hide'}
      </button>
      <p style={{fontFamily: 'pixel', backgroundColor: '#0098af', width: 'fit-content', padding: '5px', borderRadius: '7px'}}>
        CustomGridz
      </p>

  

      {!isCollapsed && (
        <div>
          <p className="text-base font-bold text-white">requirement: 100 pixels</p>

          {totalLoad ? (
            <p>Loading...</p>
          ) : totalError ? (
            <div>
              <p>total pixels: Error Load</p>
            </div>
          ) : (
            total && (
              <div>
                <p>your total pixels: {total ? total.toString() : 'N/A'}</p>

                {parseInt(total.toString(), 10) > 100 && (
                  <div>
                    <div className="slider-container">
                      <label htmlFor="grid-size-slider" className="text-white">
                        Set Your Canvas Size: {gridSize}
                      </label>
                      <input
                        id="grid-size-slider"
                        type="range"
                        min="1"
                        max="200"
                        value={gridSize}
                        onChange={handleGridSizeChange}
                        className="slider"
                      />
                    </div>

                    <button
                      onClick={handleSubmitUnlock}
                      className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900 transition w-200"
                      style={{display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'fit-content'}}
                    >
                      <FaUnlock />
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
      </div>
      </div>
    );
  }