import { z } from "zod";

export const SendMessageRequestSchema = z.object({
  clientCode: z.string(),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

export const SendReminderRequestSchema = SendMessageRequestSchema.extend({
  sendQR: z.boolean(),
});

export type SendReminderRequest = z.infer<typeof SendReminderRequestSchema>;

export const ConfigRequestSchema = z.object({
  clientCode: z.string(),
});

export type ConfigRequest = z.infer<typeof ConfigRequestSchema>;
