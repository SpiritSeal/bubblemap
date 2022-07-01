export interface nodesType {
  text: string;
  id: number;
  parent: number;
  root: boolean;
}

export interface linksType {
  source: number;
  target: number;
}

export interface dataType {
  nodes: nodesType[];
  links: linksType[];
}
