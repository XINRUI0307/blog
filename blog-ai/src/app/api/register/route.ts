import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const MAX_MEMBERS = 10;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password, role = "reader" } = body;
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email and password required" },
        { status: 400 }
      );
    }
    const approved = await prisma.user.count({ where: { status: "approved" } });
    if (approved >= MAX_MEMBERS) {
      return NextResponse.json(
        { error: "Membership is currently full" },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Username or email already registered" },
        { status: 400 }
      );
    }
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hash,
        role: role === "contributor" ? "contributor" : "reader",
        status: "pending",
        agreedTerms: true,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
