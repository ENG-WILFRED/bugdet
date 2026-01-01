"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getReminderSettings(userId: number) {
  try {
    let settings = await prisma.reminderSettings.findUnique({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.reminderSettings.create({
        data: {
          userId,
          isEnabled: true,
          reminderType: "daily",
          reminderTime: "09:00",
          timesPerWeek: 3,
          motivationalMessage: "Keep tracking your expenses! 💚",
        },
      });
    }

    return settings;
  } catch (error) {
    console.error("Error fetching reminder settings:", error);
    throw error;
  }
}

export async function updateReminderSettings(
  userId: number,
  data: {
    isEnabled?: boolean;
    reminderType?: string;
    dayOfWeek?: number;
    reminderTime?: string;
    timesPerWeek?: number;
    motivationalMessage?: string;
  }
) {
  try {
    const settings = await prisma.reminderSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
    return settings;
  } catch (error) {
    console.error("Error updating reminder settings:", error);
    throw error;
  }
}
