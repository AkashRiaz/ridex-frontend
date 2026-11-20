import z from "zod";

/*
 * Mirrors ridex-backend/src/app/module/review/review.validation.ts
 */
export const ReviewZodSchema = z.object({
  rating: z.number().int().min(1, "Choose a rating from 1 to 5 stars").max(5, "Choose a rating from 1 to 5 stars"),
  comment: z.string().trim().max(1000, "Review must be at most 1000 characters"),
});

export type ReviewInput = z.infer<typeof ReviewZodSchema>;

export const ReviewReplyZodSchema = z.object({
  reply: z.string().trim().min(1, "Write a reply").max(1000, "Reply must be at most 1000 characters"),
});
