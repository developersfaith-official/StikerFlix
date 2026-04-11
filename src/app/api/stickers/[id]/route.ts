import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIX: Await params!
    const { id } = await params
    console.log(`Fetching sticker with ID: ${id}`)

    // Query database
    const { data: sticker, error } = await supabase
      .from('Stickers')
      .select('*')
      .eq('id', parseInt(id))
      .single()

    // Check for errors
    if (error) {
      console.log(`Database error: ${error.message}`)
      return NextResponse.json(
        { error: 'Sticker not found', status: 404 },
        { status: 404 }
      )
    }

    if (!sticker) {
      console.log(`Sticker ID ${id} not found`)
      return NextResponse.json(
        { error: 'Sticker not found', status: 404 },
        { status: 404 }
      )
    }

    // Return success
    console.log(`✅ Sticker found: ${sticker.Title}`)
    return NextResponse.json(
      { success: true, data: sticker },
      { status: 200 }
    )

  } catch (err) {
    console.log(`Server error:`, err)
    return NextResponse.json(
      { error: 'Internal server error', status: 500 },
      { status: 500 }
    )
  }
}
