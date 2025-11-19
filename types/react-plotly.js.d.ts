declare module 'react-plotly.js' {
  import { Component } from 'react';
  
  interface PlotParams {
    data: any[];
    layout?: any;
    config?: any;
    style?: React.CSSProperties;
    onHover?: (event: any) => void;
    onUnhover?: (event: any) => void;
    onClick?: (event: any) => void;
    onSelected?: (event: any) => void;
  }

  export default class Plot extends Component<PlotParams> {}
}