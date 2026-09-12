import { describe, expect, it } from "vitest";
import { Sound } from "../../Play";

describe("Sound with native Web Audio", () => {
  it("creates and restarts custom waves through the native oscillator API", async () => {
    const contextOwner = new Sound("gen");
    const ctx = contextOwner.ctx;
    let sound: Sound | undefined;
    try {
      const wave = ctx.createPeriodicWave(
        new Float32Array([0, 0]),
        new Float32Array([0, 1]),
      );
      sound = Sound.generate("custom", wave);
      sound.volume = 0;
      expect((sound.node as OscillatorNode).type).toBe("custom");
      sound.start().stop().start();
      expect((sound.node as OscillatorNode).type).toBe("custom");
    } finally {
      sound?.dispose();
      await ctx.close();
    }
  });

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
