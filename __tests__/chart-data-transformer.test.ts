// @ts-ignore - vitest types (install with: pnpm add -D vitest)
import { describe, it, expect } from "vitest";
import {
  extractMultiPerformerData,
  getPerformersFromData,
  extractMultiPerformerPlaylistData,
} from "@/lib/chart-data-transformer";
import type {
  DashboardResponse,
  MultiPerformerChartDataPoint,
} from "@/lib/types/dashboard";

// Mock data
const mockDashboardData: DashboardResponse = {
  performer1: {
    spotify: {
      followers: {
        latest: 1000,
        entries: [
          {
            value: 900,
            datetime: "2026-03-01T10:00:00Z",
            performer: "performer1",
          },
          {
            value: 1000,
            datetime: "2026-03-02T10:00:00Z",
            performer: "performer1",
          },
        ],
      },
      monthly_listeners: {
        latest: 5000,
        entries: [
          {
            value: 4800,
            datetime: "2026-03-01T10:00:00Z",
            performer: "performer1",
          },
          {
            value: 5000,
            datetime: "2026-03-02T10:00:00Z",
            performer: "performer1",
          },
        ],
      },
    },
  },
  performer2: {
    spotify: {
      followers: {
        latest: 800,
        entries: [
          {
            value: 750,
            datetime: "2026-03-01T10:00:00Z",
            performer: "performer2",
          },
          {
            value: 800,
            datetime: "2026-03-02T10:00:00Z",
            performer: "performer2",
          },
        ],
      },
      monthly_listeners: {
        latest: 3000,
        entries: [
          {
            value: 2900,
            datetime: "2026-03-01T10:00:00Z",
            performer: "performer2",
          },
          {
            value: 3000,
            datetime: "2026-03-02T10:00:00Z",
            performer: "performer2",
          },
        ],
      },
    },
  },
  total: {
    spotify: {
      followers: {
        latest: 1800,
        entries: [],
      },
    },
  },
};

describe("chart-data-transformer", () => {
  describe("extractMultiPerformerData", () => {
    it("should extract data for multiple performers", () => {
      const result = extractMultiPerformerData(
        mockDashboardData,
        "spotify.followers",
      );

      expect(result).toHaveLength(2); // 2 dates
      expect(result[0].performers).toHaveProperty("performer1");
      expect(result[0].performers).toHaveProperty("performer2");
    });

    it("should return empty array for undefined data", () => {
      const result = extractMultiPerformerData(undefined, "spotify.followers");
      expect(result).toEqual([]);
    });

    it("should exclude 'total' performer", () => {
      const result = extractMultiPerformerData(
        mockDashboardData,
        "spotify.followers",
      );

      result.forEach((point: MultiPerformerChartDataPoint) => {
        expect(point.performers).not.toHaveProperty("total");
      });
    });

    it("should filter by period (7d)", () => {
      const result = extractMultiPerformerData(
        mockDashboardData,
        "spotify.followers",
        "7d",
      );

      // Should still have data as mock data is recent
      expect(result.length).toBeGreaterThan(0);
    });

    it("should sort by timestamp ascending", () => {
      const result = extractMultiPerformerData(
        mockDashboardData,
        "spotify.followers",
      );

      for (let i = 1; i < result.length; i += 1) {
        expect(result[i].timestamp).toBeGreaterThanOrEqual(
          result[i - 1].timestamp,
        );
      }
    });

    it("should extract monthly_listeners metric", () => {
      const result = extractMultiPerformerData(
        mockDashboardData,
        "spotify.monthly_listeners",
      );

      expect(result).toHaveLength(2);
      expect(result[0].performers.performer1).toBe(4800);
      expect(result[0].performers.performer2).toBe(2900);
    });

    it("should handle missing performers gracefully", () => {
      const dataWithMissingMetric: DashboardResponse = {
        performer1: {
          spotify: {
            followers: {
              latest: 1000,
              entries: [],
            },
          },
        },
      };

      const result = extractMultiPerformerData(
        dataWithMissingMetric,
        "spotify.monthly_listeners",
      );

      expect(result).toEqual([]);
    });

    it("should keep latest datetime per date", () => {
      const dataWithMultipleEntries: DashboardResponse = {
        performer1: {
          spotify: {
            followers: {
              latest: 1000,
              entries: [
                {
                  value: 900,
                  datetime: "2026-03-01T10:00:00Z",
                  performer: "performer1",
                },
                {
                  value: 950,
                  datetime: "2026-03-01T15:00:00Z",
                  performer: "performer1",
                },
                {
                  value: 1000,
                  datetime: "2026-03-01T20:00:00Z",
                  performer: "performer1",
                },
              ],
            },
          },
        },
      };

      const result = extractMultiPerformerData(
        dataWithMultipleEntries,
        "spotify.followers",
      );

      expect(result).toHaveLength(1);
      expect(result[0].performers.performer1).toBe(1000); // Latest value
    });
  });

  describe("getPerformersFromData", () => {
    it("should extract all unique performer names", () => {
      const result = extractMultiPerformerData(
        mockDashboardData,
        "spotify.followers",
      );
      const performers = getPerformersFromData(result);

      expect(performers).toContain("performer1");
      expect(performers).toContain("performer2");
      expect(performers).toHaveLength(2);
    });

    it("should return sorted list", () => {
      const result = extractMultiPerformerData(
        mockDashboardData,
        "spotify.followers",
      );
      const performers = getPerformersFromData(result);

      expect(performers).toEqual([...performers].sort());
    });

    it("should return empty array for empty data", () => {
      const performers = getPerformersFromData([]);
      expect(performers).toEqual([]);
    });

    it("should handle duplicate performers across data points", () => {
      const data = [
        {
          date: "2026-03-01",
          datetime: "2026-03-01T10:00:00Z",
          timestamp: 1704067200000,
          performers: { performer1: 100, performer2: 200 },
        },
        {
          date: "2026-03-02",
          datetime: "2026-03-02T10:00:00Z",
          timestamp: 1704153600000,
          performers: { performer1: 110, performer2: 210 },
        },
      ];

      const performers = getPerformersFromData(data);
      expect(new Set(performers).size).toBe(performers.length); // No duplicates
    });
  });

  describe("extractMultiPerformerPlaylistData", () => {
    it("should extract playlist followers data", () => {
      const dataWithPlaylists: DashboardResponse = {
        performer1: {
          spotify_playlists: [
            {
              name: "Playlist 1",
              followers: {
                latest: 500,
                entries: [
                  {
                    value: 450,
                    datetime: "2026-03-01T10:00:00Z",
                    performer: "performer1",
                  },
                  {
                    value: 500,
                    datetime: "2026-03-02T10:00:00Z",
                    performer: "performer1",
                  },
                ],
              },
              track_count: { latest: 50, entries: [] },
              tracks: [],
            },
            {
              name: "Playlist 2",
              followers: {
                latest: 300,
                entries: [
                  {
                    value: 280,
                    datetime: "2026-03-01T10:00:00Z",
                    performer: "performer1",
                  },
                  {
                    value: 300,
                    datetime: "2026-03-02T10:00:00Z",
                    performer: "performer1",
                  },
                ],
              },
              track_count: { latest: 30, entries: [] },
              tracks: [],
            },
          ],
        },
      };

      const result = extractMultiPerformerPlaylistData(dataWithPlaylists);

      expect(result).toHaveLength(2);
      expect(result[0].performers.performer1).toBeDefined();
    });

    it("should consolidate playlist followers", () => {
      const dataWithPlaylists: DashboardResponse = {
        performer1: {
          spotify_playlists: [
            {
              name: "Playlist 1",
              followers: {
                latest: 500,
                entries: [
                  {
                    value: 500,
                    datetime: "2026-03-01T10:00:00Z",
                    performer: "performer1",
                  },
                ],
              },
              track_count: { latest: 50, entries: [] },
              tracks: [],
            },
            {
              name: "Playlist 2",
              followers: {
                latest: 300,
                entries: [
                  {
                    value: 300,
                    datetime: "2026-03-01T10:00:00Z",
                    performer: "performer1",
                  },
                ],
              },
              track_count: { latest: 30, entries: [] },
              tracks: [],
            },
          ],
        },
      };

      const result = extractMultiPerformerPlaylistData(dataWithPlaylists);

      expect(result[0].performers.performer1).toBe(500); // Latest value
    });

    it("should return empty array for no playlists", () => {
      const result = extractMultiPerformerPlaylistData(mockDashboardData);
      expect(result).toEqual([]);
    });
  });
});
