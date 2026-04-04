import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const graph = await prisma.graph.findUnique({
      where: { id },
      include: {
        nodes: true,
        edges: true
      }
    });

    if (!graph) return Response.json({ success: false, error: 'Graph not found' }, { status: 404 });

    const nodes = graph.nodes.map((n: any) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      graphId: n.graphId
    }));

    const edges = graph.edges.map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      graphId: e.graphId
    }));

    return Response.json({
      success: true,
      data: {
        title: graph.title,
        nodes,
        edges
      }
    });

  } catch (err: any) {
    console.error('API /graphs/[id] error:', err);
    return Response.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error reading graph' 
    }, { status: 500 });
  }
}
