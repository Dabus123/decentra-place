import { useAccount } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { useRef, useMemo, useState, useEffect } from "react";
import { myNFTABI, myNFTAddress } from '@/myNFT';
import { HexColorPicker  } from 'react-colorful';
import { ethers } from "ethers";
import { useWriteContract ,useReadContract} from 'wagmi'
import { FaEthereum, FaUnlock, FaEraser, FaPaintBrush } from "react-icons/fa";
import { formatEther, parseEther } from "viem";
import { FaSave } from "react-icons/fa";
import {abi} from './abi';
import { config } from "./config";
import './Canvas.css'; // Import your CSS stylesheet
import { type UseAccountReturnType } from 'wagmi'
import { getAccount } from '@wagmi/core'
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { myTokenABI, myTokenAddress } from "@/myToken";

const hexToDecimal = (hexColor: string): number => {
  return parseInt(hexColor.replace(/^#/, ''), 16);
};

// Define the type for a transaction
interface Transaction {
    address: typeof myNFTAddress,
    abi: typeof myNFTABI,
    functionName: "colorPixel",
  args: (string | number)[];
}

interface EraserTransaction {
  address: typeof myNFTAddress,
  abi: typeof myNFTABI,
  functionName: "erasePixel",
args: (string | number)[];
}

interface UnlockTransaction {
  address: typeof myNFTAddress,
  abi: typeof myNFTABI,
  functionName: "unlockGrid",
args: (string | number)[];
}

interface BurnTransaction {
  address: typeof myTokenAddress,
  abi: typeof myTokenABI,
  functionName: "burn",
args: (string | number)[];
}

type AllTransactions = Transaction | BurnTransaction;

export function Upp() {
  const { contract } = useContract(myNFTAddress, myNFTABI);
  const { contract:token } = useContract(myTokenAddress, myTokenABI);
  const account = useAccount();
  const { address, isConnecting, isDisconnected } = useAccount();
  const { writeContract } = useWriteContract();
    const [id, setId] = useState<string | undefined>(undefined);
    const [transactions, setTransactions] = useState<(Transaction | BurnTransaction)[]>([]);
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [hoveredPixel, setHoveredPixel] = useState<{ x: number, y: number } | null>(null);
    const [clickedPixels, setClickedPixels] = useState<{ x: number, y: number, color: string }[]>([]);
    const [clickedPixel, setClickedPixel] = useState<{ x: number, y: number } | null>(null);
    const [eraserPixels, setEraserClickedPixels] = useState<{ x: number, y: number }[]>([]);
    const [totalPixels, setTotalClickedPixels] = useState<{ x: number, y: number }[]>([]);
    const [erasertransactions, setEraserTransactions] = useState<EraserTransaction[]>([]);
    const [unlocktransaction, setUnlockTransactions] = useState<UnlockTransaction[]>([]);
    const [selectedTool, setSelectedTool] = useState<'circle' | 'square' | 'triangle' | 'line' |'pixel'|'eraser'| null>('pixel');
    const { data: total, isLoading: totalLoad, isError:totalError } = useContractRead(contract, "totalPixels",[address]);
    const { data: balance, isLoading: balanceLoad, isError:balanceError } = useContractRead(token, "balanceOf",[address]);
    const { data: grid, isLoading: gridLoad } = useContractRead(contract, "nextId");
    const { data: eraserPixelsResult, isLoading: isEraserLoad, isError:isEraserError } = useContractRead(contract, "eraserPixels",[address]);
    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);


    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pixelSize = 3.75; // Define pixel size
    const [showMessage, setShowMessage] = useState(false);
    const [gridSize, setGridSize] = useState<number>(10); // Default grid size
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed);
    };
    



    
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
            url: "https://api.developer.coinbase.com/rpc/v1/base/T69Vc4hfmfkIwnJQPALhD0E3WXUEqD-b",
          },
        };
      }
      return {};
    }, [availableCapabilities, account.chainId]);
    
    const handlePixelClick = (x: number, y: number) => {
     
      const colorValue = hexToDecimal(selectedColor);
      if ( x < 1 || y < 1||y>100 || x>100)  {
        return;
      }
      const newTransaction: Transaction = {
        address: myNFTAddress,
        abi: myNFTABI,
        functionName: "colorPixel",
        args: [x, y, colorValue],
      };
      setClickedPixel({ x: x + 1, y: y + 1 });
      setClickedPixels((prev) => {
        const updatedPixels = prev.filter(pixel => pixel.x !== x || pixel.y !== y);
        return [...updatedPixels, { x, y, color: selectedColor }];
      });
    
      setTransactions((prev) => [
        ...prev.filter(tx => tx.args[0] !== x || tx.args[1] !== y),
        newTransaction
      ]);
    };
    
    
    const handleEraserPixelClick = (x: number, y: number) => {
     
      const newEraserTransaction: EraserTransaction = {
        address: myNFTAddress, // Type assertion
        abi: myNFTABI, // Ensure this matches your ABI type
        functionName: "erasePixel",
        args: [x, y],
      };
      setEraserClickedPixels((prev) => {
        const updatedPixels = prev.filter(pixel => pixel.x !== x || pixel.y !== y);
        return [...updatedPixels, { x, y}];
      });
      setEraserTransactions((prev) => [
        ...prev.filter(tx => tx.args[0] !== x || tx.args[1] !== y),
        newEraserTransaction
      ]);
      handlePixelClick(x, y); // Adjusted to make (0,0) at top-left

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
    

    const handleSubmit = () => {
      if (transactions.length === 0) return;
    
      // Create the burn transaction at the end
      const newBurnTransaction: BurnTransaction = {
        address: myTokenAddress,
        abi: myTokenABI,
        functionName: "burn",
        args: [], // You can adjust the args if needed
      };
    
      // Add the burn transaction to the transactions list
      const finalTransactions = [...transactions, newBurnTransaction];
    
      // Execute all transactions together
      writeContracts({
        contracts: finalTransactions,
        capabilities,
      });
    
      // Clear transactions and clicked pixels after submission
      setTransactions([]);
      setClickedPixels([]);
    };

    const handleSubmitEraser = () => {
      if (erasertransactions.length === 0) return;
      writeContracts({
        contracts: erasertransactions,
        capabilities,
      });
      setEraserTransactions([]); // Clear transactions after submission
      setEraserClickedPixels([]); 
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
        ctx.fillRect((pixel.x - 1) * pixelSize, (pixel.y - 1) * pixelSize, pixelSize, pixelSize);
      });
    
      // Draw hovered pixel for the eraser
      if (selectedTool === 'eraser' && hoveredPixel) {
        ctx.fillStyle = '#000'; // Assuming white as the eraser color
        ctx.fillRect((hoveredPixel.x - 1) * pixelSize, (hoveredPixel.y - 1) * pixelSize, pixelSize, pixelSize);
      } else if (hoveredPixel) {
        ctx.fillStyle = selectedColor;
        ctx.fillRect((hoveredPixel.x - 1) * pixelSize, (hoveredPixel.y - 1) * pixelSize, pixelSize, pixelSize);
      }
    };
    
    


  
   
    
      const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const x = Math.floor((e.clientX - rect.left) / 3.75); // Adjust for larger pixels
          const y = Math.floor((e.clientY - rect.top) / 3.75);
          setHoveredPixel({ x: x + 1, y: y + 1 });
    
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawCanvas(ctx);
          }
        }
      };

      const { data: dataPainter, error: dataPainterError } = useContractRead(
        contract,
        "pixelChanged",
        hoveredPixel ? [hoveredPixel.x, hoveredPixel.y, grid] : [null, null, grid] // or handle as needed
      );
      


      if (!hoveredPixel) {
          console.error("Error fetching dataPainter", dataPainterError);
          dataPainter === "0x00..00";
        }
      
 
    

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
    const x = Math.floor((e.clientX - rect.left) / pixelSize) + 1;
    const y = Math.floor((e.clientY - rect.top) / pixelSize) + 1;

    if (selectedTool === 'eraser') {
      handleEraserPixelClick(x, y); // Call the eraser function
    } else {
    // If startPoint is null, set the start point
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
};
    
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
         <div className="containerdash">
        <div className="bromiso" >
        {hoveredPixel && (
              <div>
          
         
          <p style={{color:'#4e4a70'}} className="mt-2">hovered pixel: X: {hoveredPixel.x}, Y: {hoveredPixel.y}</p>
          </div>
       )}
          <HexColorPicker
            color={selectedColor}
            onChange={setSelectedColor}
          />
             <div style={{position:'absolute',backgroundColor:'#0098af', padding:'5px',borderRadius:'7px'}}>
          <h1>painter: {hoveredPixel && (<p style={{fontSize:'0.7rem'}}>  X: {hoveredPixel.x}, Y: {hoveredPixel.y}</p>)}</h1>
          <p style={{fontSize:'0.43rem'}} >{dataPainter}</p>
          </div>
      
        </div>
      
        <div className='buttons'>
          <div  className="buttonsave">
        <h3 style={{fontFamily:'pixel', fontSize:'0.75rem'}}>SAVE ONCHAIN</h3>
        <button 
          onClick={handleSubmit} 
          className="bg-cyan-300 text-black px-4 py-2 rounded hover:bg-cyan-900 hover:text-white transition w-200"
          style={{minHeight:'4vh', marginRight:'0.7vh',width:'fit-content', fontSize:'5vh'}}
        >
        <FaSave/> 
        </button>
        </div>
        {!address || isEraserLoad || isEraserError ? (
  <p>Loading...</p>
) : eraserPixelsResult.toString() === '0' ? (
  <div>
     <p style={{position:'relative'}}><p style={{display: 'flex', flexDirection: 'row', fontFamily:'pixel', fontSize:'1rem'}}> <FaEraser></FaEraser> :0</p></p>
    <button 
      className="bg-blue-700 text-white rounded hover:bg-blue-900 transition"
      style={{ minWidth: 'fit-content',padding:'4px' }}
      onClick={() => 
        writeContract({ 
          abi,
          address: '0x2640A3eE3F7d7d5F766808dA8cA6a369d41bAc5D',
          functionName: 'buyEraser',
          args: [],
          value: parseEther('0.001'), 
        })
      }
      onMouseMove={handleMove}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: 'max-content' , padding:'3px'}}>
   
       <p style={{ display: 'flex', flexDirection: 'row'}}>20X  <FaEraser /></p> 
       <p>=</p>
        <h2>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
            0.001<FaEthereum />
          </div>
        </h2>
     
      </div>
    </button>
  </div>
) : (
  eraserPixelsResult && (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'fit-content', marginTop: '-2.8vh', width: 'fit-content', fontSize: '1vh' }}>
      <p style={{position:'relative'}}><p style={{display: 'flex', flexDirection: 'row', fontSize:'0.7rem'}}>  <FaEraser></FaEraser>: {eraserPixelsResult.toString()}</p></p>
      </div>
      <button 
        onClick={handleSubmitEraser} 
        className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900 transition w-200"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'fit-content', marginRight: '6vh', width: 'fit-content', fontSize: '5vh' }}
      >
        <FaEraser />
      </button>
    </div>
  )
)}

        <div className="tools">
  <button style={{display:'flex', flexDirection:'column',alignItems:'center',height:'fit-content',width:'fit-content', fontSize:'1vh'}} className="bg-green-300 text-black px-4 py-2 rounded hover:bg-red-900 hover:text-white transition w-200" onClick={() => setSelectedTool('square')}>■</button>
  <button style={{display:'flex', flexDirection:'column',alignItems:'center',height:'fit-content',width:'fit-content', fontSize:'1vh'}} className="bg-green-300 text-black px-4 py-2 rounded hover:bg-red-900 hover:text-white transition w-200" onClick={() => setSelectedTool('circle')}>◯</button>
  <button style={{display:'flex', flexDirection:'column',alignItems:'center',height:'fit-content',width:'fit-content', fontSize:'1vh'}} className="bg-green-300 text-black px-4 py-2 rounded hover:bg-red-900 hover:text-white transition w-200" onClick={() => setSelectedTool('line')}>|</button>
  <button style={{display:'flex', flexDirection:'column',alignItems:'center',height:'fit-content',width:'fit-content', fontSize:'1vh'}} className="bg-green-300 text-black px-4 py-2 rounded hover:bg-red-900 hover:text-white transition w-200" onClick={() => setSelectedTool('triangle')}>◿</button>
  <button style={{display:'flex', flexDirection:'column',alignItems:'center',height:'fit-content',width:'fit-content', fontSize:'1vh'}} className="bg-green-300 text-black px-4 py-2 rounded hover:bg-red-900 hover:text-white transition w-200" onClick={() => setSelectedTool('pixel')}>•</button>
  <button
  style={{display:'flex', flexDirection:'column',alignItems:'center',height:'fit-content',width:'fit-content', fontSize:'1vh'}}
  className="bg-red-300 text-black px-4 py-2 rounded hover:bg-red-900 hover:text-white transition w-200"
  onClick={() => setSelectedTool('eraser')}
>
  <FaEraser />
</button>

</div>

        </div>
   
</div>
        <div style={{display:'flex', flexDirection:'column'}}>
        <canvas
          ref={canvasRef}
          width={375}
          height={375}
          className="border border-gray-400 bg-black-200"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />
    
        </div>
      <div className="dynamicPend">
     
      <div className="bg-white p-4 rounded-lg shadow-lg text-gray-800" style={{marginTop:'1vh', marginBottom:'195vh'}}>
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

      {balanceLoad ? (
            <p>Connect your Wallet!</p>
          ) : balanceError ? (
            <div>
              <p>Connect your Wallet!</p>
            </div>
          ) : ( 
            balance && (
              <div>
                <p>GRIDZ balance: {balance ? formatEther( balance.toString()) : 'N/A'}</p>
              </div>
            )
          )}

      {!isCollapsed && (
        <div>
          <p className="text-base font-bold text-white">requirement: 100 pixels</p>

          {totalLoad ? (
            <p>Connect your Wallet!</p>
          ) : totalError ? (
            <div>
              <p>Connect your Wallet!</p>
            </div>
          ) : (
            total && (
              <div>
                <p>your total pixels: {total ?total.toString() : 'N/A'}</p>

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
                        max="300"
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
    );
  }