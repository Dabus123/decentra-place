// CViewPixels.stories.js
import React, { useState } from 'react';
import CustomPixelByNumber from '@/components/storybook/MViewPixels';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Base } from '@thirdweb-dev/chains';
import {
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import './css.css';

export default {
  title: 'MViewPixels', // The title of your story
  component: CustomPixelByNumber,
};

// Create a custom Template
const Template = (args) => {
  const [inputValue, setInputValue] = useState('1'); // Initialize input state

  // Function to handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value); // Update the input value
  };

  // Parse the input value to create filterNumbers array and id
  const filterNumbers = inputValue.split(',').map(Number).filter(Boolean); // Convert input string to array of numbers
  const id = filterNumbers.length > 0 ? filterNumbers[0] : 1; // Use the first number as the id or default to 3

  return (
    <div>
      <div>
        <label>
          <input 
            type="text" 
            value={inputValue} 
            onChange={handleInputChange} 
            style={{ margin: '10px 0px', maxWidth:'20px', padding:'5px', fontFamily:'Pixel' }} // Add some spacing
          />
        </label>
      </div>
      <ThirdwebProvider
        activeChain={Base}
        clientId={process.env.CLIENT_ID}
        supportedWallets={[
          coinbaseWallet(),
          metamaskWallet(),
          walletConnect()
        ]}
      >
        <CustomPixelByNumber filterNumbers={filterNumbers} id={id} />
      </ThirdwebProvider>
    </div>
  );
};

// Define the PixelGrid story
export const PixelGrid = Template.bind({});
PixelGrid.args = {
  filterNumbers: [1], // Default args to pass into your component
  id: 1, // Default ID (modify this as needed)
};

// Figma design link (if applicable)
PixelGrid.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/your-figma-design-url', // Replace with your Figma design URL
  },
};
