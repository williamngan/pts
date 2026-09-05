import { describe, expect, it } from "vitest";
import { Sound } from "../../Play";

describe("Sound with native Web Audio", () => {
  it("ends a native input track when disposed before playback", async () => {
    const ctx = new AudioContext();
    const stream = ctx.createMediaStreamDestination().stream;
    const track = stream.getAudioTracks()[0];
    const sound = Sound.from(
      ctx.createMediaStreamSource(stream),
      ctx,
      "input",
      stream,
    );
    try {
      expect(track.readyState).toBe("live");
      sound.dispose().dispose();
      expect(track.readyState).toBe("ended");
    } finally {
      track.stop();
      await ctx.close();
    }
  });
});
