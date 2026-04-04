export type NodeOutput = string;
export type EdgeOutput = [string, string, string];

export interface GraphOutput {
  nodes: NodeOutput[];
  edges: EdgeOutput[];
}

export interface AppNode {
  id: string;
  label: string;
  graphId: string;
}

export interface AppEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  graphId: string;
}

export interface AppGraph {
  id: string;
  title: string;
  version: number;
  nodes: AppNode[];
  edges: AppEdge[];
}
