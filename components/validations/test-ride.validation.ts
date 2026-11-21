import z from "zod";
import { DAY_NAMES, TEST_RIDE_LIMITS } from "@/lib/enum";

/*
 * Mirrors ridex-backend/src/app/module/testRide/testRide.validation.ts
 */

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use the HH:mm format");

const note = z
  .string()
  .trim()
  .max(TEST_RIDE_LIMITS.noteMax, `A note can be at most ${TEST_RIDE_LIMITS.noteMax} characters`);

export const BookTestRideZodSchema = z.object({
  startsAt: z.string().min(1, "Pick a time slot"),
  note,
});

export type BookTestRideInput = z.infer<typeof BookTestRideZodSchema>;

export const TestRideNoteZodSchema = z.object({ note });

export const TestRideReasonZodSchema = z.object({
  reason: z.string().trim().min(3, "Please give a reason").max(TEST_RIDE_LIMITS.noteMax, "The reason is too long"),
});

export const AvailabilityRuleZodSchema = z
  .object({
    listingId: z.string().nullable(),
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: time,
    endTime: time,
    slotMinutes: z.number().int().positive(),
    capacity: z
      .number({ message: "Enter a number" })
      .int()
      .min(1, "At least 1")
      .max(TEST_RIDE_LIMITS.maxCapacity, `At most ${TEST_RIDE_LIMITS.maxCapacity}`),
  })
  .refine((rule) => toMinutes(rule.startTime) < toMinutes(rule.endTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine((rule) => toMinutes(rule.endTime) - toMinutes(rule.startTime) >= rule.slotMinutes, {
    message: "The range is shorter than one slot",
    path: ["endTime"],
  });

export const AvailabilityZodSchema = z
  .object({
    rules: z
      .array(AvailabilityRuleZodSchema)
      .max(TEST_RIDE_LIMITS.maxRules, `You can set at most ${TEST_RIDE_LIMITS.maxRules} time ranges`),
  })
  .superRefine((value, ctx) => {
    // ranges for the same day and scope must not overlap
    const groups = new Map<string, { index: number; start: number; end: number }[]>();

    value.rules.forEach((rule, index) => {
      const key = `${rule.listingId ?? "default"}|${rule.dayOfWeek}`;
      groups.set(key, [...(groups.get(key) ?? []), { index, start: toMinutes(rule.startTime), end: toMinutes(rule.endTime) }]);
    });

    for (const group of groups.values()) {
      const sorted = [...group].sort((a, b) => a.start - b.start);

      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].start < sorted[i - 1].end) {
          ctx.addIssue({
            code: "custom",
            path: ["rules", sorted[i].index, "startTime"],
            message: `Overlaps another ${DAY_NAMES[value.rules[sorted[i].index].dayOfWeek]} range`,
          });
        }
      }
    }
  });

export type AvailabilityInput = z.infer<typeof AvailabilityZodSchema>;

export const BlockedDateZodSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  reason: note,
});

export type BlockedDateInput = z.infer<typeof BlockedDateZodSchema>;
