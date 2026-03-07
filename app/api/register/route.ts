import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()

  const { name, email, phone, password, role } = body

  if (!name || !email || !phone || !password || !role) {
    return NextResponse.json(
      { message: "All fields required" },
      { status: 400 }
    )
  }

  return NextResponse.json({
    message: `${role} registered successfully!`,
  })
}