import { Timestamp } from 'firebase/firestore';

export interface node {
  id: number;
  text: string;
  parent: number;
  children: number[];
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
