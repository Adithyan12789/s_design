import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/sitemap.xml', request.url), 301)
}
