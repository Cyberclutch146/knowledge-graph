import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 12;

    const graphs = await prisma.graph.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: {
          select: { nodes: true, edges: true } 
        }
      }
    });

    const total = await prisma.graph.count();

    return Response.json({
      success: true,
      data: {
        graphs,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (err: any) {
    console.error('API /graphs error:', err);
    return Response.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error reading graphs' 
    }, { status: 500 });
  }
}
