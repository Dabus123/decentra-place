declare module 'react-color' {
    import * as React from 'react';
  
    export interface ColorResult {
      hex: string;
      rgb: {
        r: number;
        g: number;
        b: number;
        a: number;
      };
      hsl: {
        h: number;
        s: number;
        l: number;
        a: number;
      };
    }
  
    export interface ColorPickerProps {
      color: string | { r: number; g: number; b: number; a?: number };
      onChange: (color: ColorResult) => void;
      onChangeComplete?: (color: ColorResult) => void;
    }
  
    export class ChromePicker extends React.Component<ColorPickerProps> {}
    export class SketchPicker extends React.Component<ColorPickerProps> {}
    // Add other pickers as needed
  }
  