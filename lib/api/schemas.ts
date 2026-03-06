import { z } from "zod";

/**
 * Zod schemas for API response validation
 * Single source of truth for data structure validation
 */

// Metric Entry - Single data point with timestamp
export const MetricEntrySchema = z.object({
  value: z.number(),
  datetime: z.string(), // ISO 8601
  performer: z.string().optional(), // Only in "total"
});

// Metric Data - Latest value + historical entries
export const MetricDataSchema = z.object({
  latest: z.number(),
  entries: z.array(MetricEntrySchema),
});

// Platform-specific metrics
export const PlatformMetricsSchema = z.object({
  followers: MetricDataSchema,
  views: MetricDataSchema.optional(), // YouTube only
  video_count: MetricDataSchema.optional(), // YouTube only
  post_count: MetricDataSchema.optional(), // Instagram only
  monthly_listeners: MetricDataSchema.optional(), // Spotify only
});

// Spotify Playlist Track
export const SpotifyPlaylistTrackSchema = z.object({
  name: z.string(),
  thumbnail_url: z.string().optional(),
  play_count: z.string(), // String in API, convert with parseInt()
});

// Spotify Playlist Data
export const SpotifyPlaylistDataSchema = z.object({
  name: z.string(),
  thumbnail_url: z.string().optional(),
  followers: MetricDataSchema,
  track_count: MetricDataSchema,
  tracks: z.array(SpotifyPlaylistTrackSchema),
});

// Performer Data (base for all performers)
export const PerformerDataSchema = z.object({
  youtube: PlatformMetricsSchema.optional(),
  instagram: PlatformMetricsSchema.optional(),
  spotify: PlatformMetricsSchema.optional(),
  spotify_playlists: z.array(SpotifyPlaylistDataSchema).optional(),
});

// Company Data (extends Performer with performers list)
export const CompanyDataSchema = PerformerDataSchema.extend({
  performers: z.array(z.string()),
});

// Dashboard Response (flat structure with optional company)
export const DashboardResponseSchema = z
  .object({})
  .catchall(z.union([PerformerDataSchema, CompanyDataSchema]))
  .refine(
    (data) =>
      !("company" in data) || CompanyDataSchema.safeParse(data.company).success,
    { message: "Invalid company data structure" },
  );

// Type inference from schemas
export type MetricEntry = z.infer<typeof MetricEntrySchema>;
export type MetricData = z.infer<typeof MetricDataSchema>;
export type PlatformMetrics = z.infer<typeof PlatformMetricsSchema>;
export type SpotifyPlaylistTrack = z.infer<typeof SpotifyPlaylistTrackSchema>;
export type SpotifyPlaylistData = z.infer<typeof SpotifyPlaylistDataSchema>;
export type PerformerData = z.infer<typeof PerformerDataSchema>;
export type CompanyData = z.infer<typeof CompanyDataSchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;

/**
 * Validates raw data against schema and logs errors
 * @param data - Raw data to validate
 * @param schema - Zod schema to validate against
 * @param context - Optional context for logging (endpoint, etc.)
 * @returns Validated data or null if invalid
 */
export function validateData<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context: string = "Unknown endpoint",
): T | null {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`[API Validation Error] ${context}`, {
      errors: result.error.flatten(),
      preview: JSON.stringify(data).slice(0, 200),
    });
    return null;
  }

  return result.data;
}
