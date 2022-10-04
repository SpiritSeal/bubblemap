import { Timestamp } from 'firebase/firestore';

import { SimulationNodeDatum } from 'd3-force';

export interface node {
  id: number;
  text: string;
  parent: number;
}

export interface localNode extends node, SimulationNodeDatum {
  children?: number[];
  selected?: boolean;
}

export interface MindMap {
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
  owner: string;
  permissions: {
    read?: string[];
    write?: string[];
    delete?: string[];
  };
  nodes: node[];
}
