'use client';
import { ThirdwebProvider, useContractRead } from '@thirdweb-dev/react';
import { Base } from '@thirdweb-dev/chains';
import React, { useEffect, useState } from 'react';
import ViewPixelByNumber from '@/components/artgridzgallery/MViewPixels'; 
import ViewPixelByNumberBig from '@/components/artgridzgallery/MViewPixels copy'; 
import CustomPixelByNumber from '@/components/customgallery/MViewPixels'; 
import CustomPixelByNumberBig from '@/components/customgallery/MViewPixels copy'; 
import { myNFTABI } from '@/myNFT'; 
import { useContract } from '@thirdweb-dev/react';
import './Canvas.css';
import sweep from '../sweep.png';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';
import OnchainProviders from '@/components/OnchainProviders';
import WalletComponents from '@/components/WalletComponents';
import {
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
} from "@thirdweb-dev/react";

const CONTRACT_ADDRESS = "0x2640A3eE3F7d7d5F766808dA8cA6a369d41bAc5D"; 

interface ArtworkDisplayProps {
  setArtworkId: (id: number) => void; 
}

const ArtworkDisplay: React.FC<ArtworkDisplayProps> = ({ setArtworkId }) => {
  const { contract } = useContract(CONTRACT_ADDRESS, myNFTABI);
  const { data: nextId, isLoading: loadingNextId } = useContractRead(contract, "nextId");
  const { data: colored, isLoading: loadingColored } = useContractRead(contract, "coloredId");

  useEffect(() => {
    if (!loadingNextId) {
      setArtworkId(nextId ? Number(nextId) : 1);
    }
  }, [loadingNextId, nextId, setArtworkId]);

  return loadingNextId ? <div>Loading...</div> : (
    <div className='connect'>
      <div className='counter'>
        <p>Next ArtGridz Mint: GRID#{nextId?.toString()}</p> 
        <p>Pixels Left: {10000 - colored} </p>
      </div>
    </div>
  );
};

const Marketplace = () => {
  const [artworkId, setArtworkId] = useState(1);
  const totalArtworks = 100; // Assume total artworks is fetched from somewhere or is a constant
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5; // Items to display per page
  const [isArtGallery, setIsArtGallery] = useState(true);

  // Handle the selection of an artwork ID
  const handleArtworkSelect = (id: number) => {
    console.log(`Selected Artwork ID: ${id}`); // Debugging output
    setArtworkId(id); // Update the selected artwork ID
  };

  const handleSliderChange = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'right' && (currentPage + 1) * itemsPerPage < totalArtworks) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate current items to display
  const currentItems = Array.from({ length: itemsPerPage }, (_, i) => currentPage * itemsPerPage + i + 1).filter(id => id <= totalArtworks);

  const toggleGallery = () => {
    setIsArtGallery(!isArtGallery);
  };

  return (
    <ThirdwebProvider activeChain={Base} clientId='51f0ab83ae35cead629f58d9fbded3ec' supportedWallets={[
      coinbaseWallet(),
      metamaskWallet(),
      walletConnect()
    ]}>
      <OnchainProviders>
        <div className='main'>
          <Link href="/" passHref>
            <div className='connect'>
              <WalletComponents />
            </div>
            <button style={{maxWidth:'fit-content'}} className='home'>
              <div> <FaHome /></div> 
            </button>
          </Link>
          <div className='logo'>
            <img src={sweep.src} alt="Description of the image" style={{  left: '0%',width: '80%', maxWidth: '500px' }} />
            <h1 style={{ position: 'absolute', left: '0%', top: '97%', color: '#e9fbf2', fontSize: '4vh', fontFamily: 'onchain', width: 'fit-content' }}>
              nFTs
            </h1>
          </div>
       
          <ArtworkDisplay setArtworkId={setArtworkId} />
          <button onClick={toggleGallery} className='switch' style={{display:'flex', flexDirection:'row',fontSize:'0.8rem', width:'fit-content',marginLeft:'20px',marginTop: '60px',color:'#000', padding: '10px', cursor: 'pointer',backgroundColor:'#e9fbf2'}}>
            <p style={{fontFamily:'pixel',color:'#000', width:'fit-content', padding: '5px'}}>ArtGridz ←→</p> 
            <p style={{fontFamily:'pixel', color:'#000',width:'fit-content', padding: '5px'}}>CustomGridz</p> 
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',marginLeft:'15px'}}>
      
       
            <div className='gallerycanvas'>
            
            <div className='navigation'>
              <button style={{display:'flex',justifyContent:'center',fontFamily:'Pixel', borderWidth:'2px', borderColor:'#ff0000',backgroundColor:'#0000ff'}} onClick={() => handleSliderChange('left')} disabled={currentPage === 0}>
                -5
              </button>
              <button style={{display:'flex',justifyContent:'center',fontFamily:'Pixel', borderWidth:'2px', borderColor:'#ff0000',backgroundColor:'#0000ff'}}  onClick={() => handleSliderChange('right')} disabled={(currentPage + 1) * itemsPerPage >= totalArtworks}>
                +5
              </button>
              </div>
              {isArtGallery 
                ? <div><ViewPixelByNumberBig filterNumbers={[artworkId]} /></div> // Update to use artworkId
                : <div><CustomPixelByNumberBig filterNumbers={[artworkId]} id={[artworkId]} /></div> // Update to use artworkId
              }

              
            </div>
          </div>
          <div>
            {currentItems.map((id, index) => (
              <div className='gallery'>
              <div key={index} style={{ margin: '3px', cursor: 'pointer', zIndex:'3' }} onClick={() => handleArtworkSelect(id)}>
                {isArtGallery 
                  ? <div  className='galleries' style={{ display: 'flex', justifyContent: 'center' }}><div className='idi'><h2>GRID#{id}</h2></div><ViewPixelByNumber filterNumbers={[id]} /></div>
                  : <div className='galleries' style={{ display: 'flex', justifyContent: 'center' }}><div className='idi'><h2 >CustomGrid#{id}</h2></div> <CustomPixelByNumber filterNumbers={[id]} id={[id]}/></div>
                }
              </div>
              </div>
            ))}
          </div>
        </div>
      </OnchainProviders>
    </ThirdwebProvider>
  );
};

export default Marketplace;