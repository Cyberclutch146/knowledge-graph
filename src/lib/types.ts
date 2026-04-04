export interface NodeOutput {
  label: string;
  type: string;
}

export type EdgeOutput = [string, string, string];

export interface GraphOutput {
  title?: string;
  nodes: NodeOutput[];
  edges: EdgeOutput[];
}

export interface AppNode {
  id: string;
  label: string;
  type: string;
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
