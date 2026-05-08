import { NextResponse } from 'next/server'
import { getRecentRoasts } from '@/lib/recentRoasts'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(getRecentRoasts())
}
