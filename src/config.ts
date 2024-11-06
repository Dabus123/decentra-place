// use NODE_ENV to not have to change config based on where it's deployed
import { createClient, createPublicClient, http } from "viem";
import { base } from "viem/chains";

import { ENTRYPOINT_ADDRESS_V06 } from "permissionless";
import { paymasterActionsEip7677 } from "permissionless/experimental";

export const NEXT_PUBLIC_URL =
  process.env.NODE_ENV == 'development'
    ? 'http://localhost:3000'
    : 'https://artgridz.decentraplace.io';
// Add your API KEY from the Coinbase Developer Portal
export const NEXT_PUBLIC_CDP_API_KEY = process.env.NEXT_PUBLIC_CDP_API_KEY;

export const client = createPublicClient({
  chain: base,
  transport: http(),
});

 
const paymasterService = process.env.PAYMASTER_SERVICE_URL;
 
export const paymasterClient = createClient({
  chain: base,
  transport: http(paymasterService),
}).extend(paymasterActionsEip7677(ENTRYPOINT_ADDRESS_V06));