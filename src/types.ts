import { Timestamp } from 'firebase/firestore';
import { SimulationNodeDatum } from 'd3-force';

export interface node {
  parent: number;
  text: string;
  id: number;
}

export interface localNode extends node, SimulationNodeDatum {
  children?: number[];
  selected?: boolean;
}

export interface MindMap {
  title: string;
  nodes: node[];
  metadata: {
    createdAt: Timestamp;
    createdBy: string;
    updatedAt: Timestamp;
    updatedBy: string;
    everUpdatedBy: string[];
  };
  permissions: {
    owner: string;
    isPublic: boolean;
    canPublicEdit: boolean;
  };
}

export type WithID<T> = T & {
  ID: string;
};

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
