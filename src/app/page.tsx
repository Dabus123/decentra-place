'use client';
import { useState, useEffect } from 'react';
import { Base } from '@thirdweb-dev/chains';
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import OnchainProviders from '@/components/OnchainProviders';
import ViewPixel from '@/components/ViewPixel';
import { Upp } from '@/components/Upp';
import { useRouter,usePathname  } from 'next/navigation'; 
import WalletComponents from '@/components/WalletComponents';
import logow from './logow.png';
import base from './base.png';
import sweep from './sweep.png';
import './css.css';
import { FaExchangeAlt, FaPaintBrush } from 'react-icons/fa';
import { CUpp } from '@/components/CUpp';
import CViewPixel from '@/components/CViewPixel';
import Link from 'next/link';

export default function Page() {
  const [isCustomGridzActive, setIsCustomGridzActive] = useState(false);
  const [key, setKey] = useState(Date.now()); 
  const router = useRouter(); // Initialize useRouter
  const pathname = usePathname();

  const toggleCustomGridz = () => {
    setIsCustomGridzActive(prevState => !prevState);
  };

  // Detect route change to reload when navigating from /market back
  useEffect(() => {
    if (pathname === '/') {
      router.refresh();
    } else if (pathname === '/market') {
      // Reload if the user navigates back from /market
      router.refresh();
    }
  }, [pathname, router]);
  

  return (
    <div style={{marginLeft:'2vw', color: '#FFF', height:'fit-content'}}>
  
  <div className='dynamicPage'>
             <div style={{ width: '80%', maxWidth: '400px' }} />
           
             <div className='logo' style={{display:'flex', flexDirection:'column', justifyContent:'baseline',alignItems:'center', marginTop:'15%'}}>
             <img src={sweep.src} alt="Description of the image" style={{ width: '60%', maxWidth: '500px' }} />
           
             </div>
           </div>
  
      <ThirdwebProvider activeChain={Base} clientId="" supportedWallets={[
        coinbaseWallet(),
        metamaskWallet(),
        walletConnect()
      ]}>
        <OnchainProviders>
          
          <div style={{display:'flex', justifyContent:'baseline', alignItems:'center',marginTop:'30vh'}}>
           
            {isCustomGridzActive ? (
              <div>
                   
      
         <div className='components'>
         <div className='connect'>
           <WalletComponents />
           <div className='nft-button' style={{ textAlign: 'center', marginTop: '20px' }}>
      <Link href="/market" passHref>
        <button onClick={() => setKey(Date.now())} style={{ backgroundColor: '#fff', color: '#000', padding: '10px 40px', fontSize: '16px', borderRadius: '8px', fontFamily: 'onchain', width: 'fit-content' }}>
          nFTs
        </button>
      </Link>
      <div  className='dynamicPage2'>   <button  onClick={toggleCustomGridz} style={{backgroundColor:'#fff', color: '#000',marginBottom: '20px', width:'fit-content',zIndex:'3'}}>
  <p>go back to</p> <p style={{fontFamily:'pixel', width:'fit-content', padding: '5px', fontSize:'1.05rem'}}> ArtGridz</p> 
            </button></div>
    </div>
         </div>
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
           <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
             <CViewPixel/>
             <div style={{ position: 'absolute', bottom: '0%', right: '0%' }}>
               <CUpp />
             </div>
           </div>
         </div>
       </div>
       </div>
            ) : (
              <div>
              
             
              <div className='components'>
              <div className='connect'>
                <WalletComponents />
                <div className='nft-button' style={{ textAlign: 'center', marginTop: '20px' }}>
      <Link href="/market" passHref>
        <button style={{ backgroundColor: '#fff', color: '#000', padding: '10px 40px', fontSize: '16px', borderRadius: '8px', fontFamily: 'onchain', width: 'fit-content' }}>
          nFTs
        </button>
      </Link>
      <div  className='dynamicPage2'>   <button  onClick={toggleCustomGridz} style={{backgroundColor:'#fff', color: '#000', marginBottom: '20px', width:'fit-content'}}>
  <p>switch to</p> <p style={{fontFamily:'pixel', width:'fit-content', padding: '5px', fontSize:'0.8rem'}}>CustomGridz</p> 
            </button></div>
    </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center',marginRight:'7px', alignItems: 'center', flexDirection: 'column' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                  <ViewPixel />
                  <div style={{ position: 'absolute', bottom: '0%', right: '0%' }}>
                    <Upp />
                  </div>
                </div>
              </div>
            </div>
            </div>
            )}
          </div>
          
        </OnchainProviders>
      </ThirdwebProvider>
    </div>
  );
}
