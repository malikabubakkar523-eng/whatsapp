import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUsername, cleanUsername } from "@/utils/username";
import { getAuthSession } from "@/lib/auth";

function generateCandidateUsernames(base: string, displayName?: string | null): string[] {
  const clean = (base || "user").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 18);
  const candidates: string[] = [];

  const rand2 = Math.floor(10 + Math.random() * 90);
  const rand3 = Math.floor(100 + Math.random() * 900);
  const randYear = Math.floor(2025 + Math.random() * 2);

  // 1. Number variations
  candidates.push(`${clean}_${rand2}`);
  candidates.push(`${clean}${rand2}`);
  candidates.push(`${clean}_${rand3}`);
  candidates.push(`${clean}${randYear}`);

  // 2. Stylish prefixes
  if (clean.length <= 15) {
    candidates.push(`iam_${clean}`);
    candidates.push(`the_${clean}`);
    candidates.push(`real_${clean}`);
  }

  // 3. Stylish suffixes
  if (clean.length <= 14) {
    candidates.push(`${clean}_pk`);
    candidates.push(`${clean}_official`);
    candidates.push(`${clean}_dev`);
    candidates.push(`${clean}_chat`);
    candidates.push(`${clean}_vip`);
  }

  // 4. From Display Name if provided
  if (displayName) {
    const parts = displayName.toLowerCase().trim().split(/\s+/);
    if (parts.length >= 2) {
      const p1 = parts[0].replace(/[^a-z0-9]/g, "");
      const p2 = parts[1].replace(/[^a-z0-9]/g, "");
      if (p1 && p2) {
        candidates.push(`${p1}_${p2}`);
        candidates.push(`${p1}_${p2}${rand2}`);
        candidates.push(`${p2}_${p1}`);
      }
    }
  }

  return Array.from(new Set(candidates)).filter(
    (c) => /^[a-z0-9_]{3,30}$/.test(c) && c !== clean
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUsername = searchParams.get("username");
    const rawDisplayName = searchParams.get("displayName");
    const isSuggestOnly = searchParams.get("suggest") === "true";

    // If requesting auto-suggestions on demand
    if (isSuggestOnly || !rawUsername) {
      const baseSeed = rawUsername || rawDisplayName || "user";
      const candidates = generateCandidateUsernames(baseSeed, rawDisplayName);
      const taken = await prisma.profile.findMany({
        where: { username: { in: candidates } },
        select: { username: true },
      });
      const takenSet = new Set(taken.map((t) => t.username.toLowerCase()));
      const suggestions = candidates.filter((c) => !takenSet.has(c.toLowerCase())).slice(0, 4);

      return NextResponse.json({
        available: false,
        suggestions,
      });
    }

    const validation = validateUsername(rawUsername);
    if (!validation.isValid) {
      const candidates = generateCandidateUsernames(validation.cleaned || "user", rawDisplayName);
      const taken = await prisma.profile.findMany({
        where: { username: { in: candidates } },
        select: { username: true },
      });
      const takenSet = new Set(taken.map((t) => t.username.toLowerCase()));
      const suggestions = candidates.filter((c) => !takenSet.has(c.toLowerCase())).slice(0, 4);

      return NextResponse.json({
        available: false,
        error: validation.error,
        cleaned: validation.cleaned,
        suggestions,
      });
    }

    const cleanUser = validation.cleaned;

    // Check if the current logged in user already owns this username
    const session = await getAuthSession(req);
    let isOwnUsername = false;
    if (session) {
      const currentProfile = await prisma.profile.findUnique({
        where: { userId: session.userId },
      });
      if (currentProfile && currentProfile.username.toLowerCase() === cleanUser) {
        isOwnUsername = true;
      }
    }

    if (isOwnUsername) {
      return NextResponse.json({
        available: true,
        message: "This is your current username",
        cleaned: cleanUser,
      });
    }

    const existing = await prisma.profile.findUnique({
      where: { username: cleanUser },
    });

    if (existing) {
      // Username is taken -> automatically generate 4 verified available alternatives
      const candidates = generateCandidateUsernames(cleanUser, rawDisplayName);
      const taken = await prisma.profile.findMany({
        where: { username: { in: candidates } },
        select: { username: true },
      });
      const takenSet = new Set(taken.map((t) => t.username.toLowerCase()));
      const availableSuggestions = candidates
        .filter((c) => !takenSet.has(c.toLowerCase()))
        .slice(0, 4);

      return NextResponse.json({
        available: false,
        error: `✕ @${cleanUser} is already taken`,
        cleaned: cleanUser,
        suggestions: availableSuggestions,
      });
    }

    return NextResponse.json({
      available: true,
      message: `✓ @${cleanUser} is available`,
      cleaned: cleanUser,
    });
  } catch (error) {
    console.error("Check username error:", error);
    return NextResponse.json({ available: false, error: "Internal server error" }, { status: 500 });
  }
}
