import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const KB_DIR = path.join(process.cwd(), 'knowledge', 'ui', 'pages');

function getKbPath(route: string): string {
  if (route === '/') {
    return path.join(KB_DIR, 'root.md');
  }
  return path.join(KB_DIR, route.slice(1), 'page.md');
}

function parseRoute(encodedRoute: string): string {
  // Decode the route (it comes URL encoded)
  return decodeURIComponent(encodedRoute);
}

// GET - Read KB doc content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ route: string }> }
) {
  try {
    const { route: encodedRoute } = await params;
    const route = parseRoute(encodedRoute);
    const kbPath = getKbPath(route);

    if (!fs.existsSync(kbPath)) {
      return NextResponse.json(
        { error: 'KB doc not found', route, kbPath },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(kbPath, 'utf8');

    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    let meta: Record<string, string> = {};
    let body = content;

    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      body = frontmatterMatch[2];

      // Parse YAML-like frontmatter
      frontmatter.split('\n').forEach(line => {
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
          meta[match[1]] = match[2];
        }
      });
    }

    return NextResponse.json({
      route,
      kbPath: path.relative(process.cwd(), kbPath),
      content,
      meta,
      body,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update KB doc content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ route: string }> }
) {
  try {
    const { route: encodedRoute } = await params;
    const route = parseRoute(encodedRoute);
    const kbPath = getKbPath(route);

    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Ensure directory exists
    const dir = path.dirname(kbPath);
    fs.mkdirSync(dir, { recursive: true });

    // Write the file
    fs.writeFileSync(kbPath, content, 'utf8');

    return NextResponse.json({
      success: true,
      route,
      kbPath: path.relative(process.cwd(), kbPath),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
