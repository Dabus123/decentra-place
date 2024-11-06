'use client'

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'
// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'ffc1d981fe1ffed856fe01d26584a1c4'

// 2. Set chains
const base = {
  chainId: 8453,
  name: 'Base',
  currency: 'ETH',
  explorerUrl: 'https://basescan.org/',
  rpcUrl: 'https://api.developer.coinbase.com/rpc/v1/base/T69Vc4hfmfkIwnJQPALhD0E3WXUEqD-b'
}

// 3. Create a metadata object
const metadata = { 
  name: 'ArtGridz', 
  description: 'Collaborative pixel art on the blockchain.', 
  url: 'https://artgridz.decentraplace.io', 
  icons: ['https://pbs.twimg.com/profile_images/1809230011804909568/vRhOg4Lx_400x400.jpg']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: 'https://api.developer.coinbase.com/rpc/v1/base/T69Vc4hfmfkIwnJQPALhD0E3WXUEqD-b', // used for the Coinbase SDK
  defaultChainId: 8453 // used for the Coinbase SDK
})

// 5. Create a AppKit instance
createWeb3Modal({
  ethersConfig,
  chains: [base],
  projectId,
  enableAnalytics: true // Optional - defaults to your Cloud configuration
})

export function AppKit({ children }: React.PropsWithChildren<{}>) {
    return <>{children}</>;
  }