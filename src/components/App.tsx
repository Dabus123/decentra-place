import { useAccount } from "wagmi";
import { useCapabilities, useWriteContracts , UseWriteContractsParameters} from "wagmi/experimental";
import { useMemo, useState } from "react";
import { myNFTABI, myNFTAddress } from '@/myNFT';
import { ethers } from "ethers";
import { parseEther } from "viem";
import { paymasterClient } from "@/config";
import { url } from "inspector";
 
export function App() {
  const account = useAccount();
  const [id, setId] = useState<string | undefined>(undefined);
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
          url: `${process.env.PAYMASTER_SERVICE_URL}`,
        },
      };
    }
    return {};
  }, [availableCapabilities, account.chainId]);
 
  return (
    <div>
      <h2>Transact With Paymaster</h2>
      <p>{JSON.stringify(capabilities)}</p>
      <div>
      <button
          onClick={() => {
            writeContracts({
              contracts: [
                {
                    address: myNFTAddress,
                    abi: myNFTABI,
                    functionName: "accessPassPixel",
                    args: [1,3,25265],
                },
                {
                    address: myNFTAddress,
                    abi: myNFTABI,
                    functionName: "accessPassPixel",
                    args: [1,4,25265],
                },
                {
                    address: myNFTAddress,
                    abi: myNFTABI,
                    functionName: "accessPassPixel",
                    args: [1,5,25265],
                },
              ],
              capabilities: {
                paymasterService: {
                url:process.env.PAYMASTER_SERVICE_URL,
              },
            },
            },
            
        );
          }}
        >
          Color Pixel
        </button>
       
      </div>
    </div>
  );
}