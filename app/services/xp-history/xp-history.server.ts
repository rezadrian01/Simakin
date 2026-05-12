import { db } from "~/lib/db.server";
import type { XPSource } from "@prisma/client";

/**
 * Log an EXP gain event.
 * Creates an XPHistory record and increments User.totalScore atomically.
 * All EXP increments to User.totalScore must go through this function.
 */
export async function logXPGain(
  userId: string,
  amount: number,
  source: XPSource,
  sourceId?: string
): Promise<void> {
  await db.$transaction([
    db.xPHistory.create({
      data: {
        userId,
        amount,
        source,
        sourceId,
      },
    }),
    db.user.update({
      where: { id: userId },
      data: { totalScore: { increment: amount } },
    }),
  ]);
}