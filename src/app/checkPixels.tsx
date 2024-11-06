import React, { ReactNode } from 'react';
import { useContract, useContractRead } from "@thirdweb-dev/react";
import { myNFTABI, myNFTAddress } from '@/myNFT';
import { useAccount } from "wagmi";

interface PixelCheckProps {
  children: ReactNode; // Correctly types the children prop
}

export default function PixelCheck({ children }: PixelCheckProps) {
  const { address } = useAccount();
  const { contract } = useContract(myNFTAddress, myNFTABI);
  const { data: total, isLoading, isError } = useContractRead(contract, "totalPixels", [address]);

  if (isLoading) {
    return <div>Loading...</div>; // Handle the loading state
  }

  if (isError || total === undefined) {
    return <div>Error loading data</div>; // Handle errors or undefined data
  }

  // Convert the total to a number and check if it's greater than 100
  const isGreaterThan100 = parseInt(total.toString(), 10) > 100;

  // Conditional rendering: render children if totalPixels is greater than 100
  return isGreaterThan100 ? <>{children}</> : null;
}
