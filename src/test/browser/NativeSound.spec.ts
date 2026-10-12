import { describe, expect, it } from "vitest";
import { Sound } from "../../Play";

describe("Sound with native Web Audio", () => {
  it.each(["stop", "volume", "seek", "restart"])(
    "smooths %s transitions in rendered audio",
    async (action) => {
      const rate = 48000;
      const ctx = new OfflineAudioContext(1, rate / 5, rate);
      const buffer = ctx.createBuffer(1, rate / 5, rate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = Math.sin((2 * Math.PI * 440 * i) / rate);
      const sound = new Sound(
        "file",
        ctx as unknown as AudioContext,
      ).createBuffer(buffer);
      sound.start();
      const paused = ctx.suspend(0.025);
      const rendered = ctx.startRendering();
      await paused;
      const changedAt = ctx.currentTime;
      if (action === "stop") sound.stop();
      if (action === "volume") sound.volume = 0;
      if (action === "seek") sound.start(0.013);
      if (action === "restart") sound.stop().start();
      await ctx.resume();
      const output = (await rendered).getChannelData(0);
      let jump = 0;
      for (let i = 1; i < Math.floor(0.1 * rate); i++)
        jump = Math.max(jump, Math.abs(output[i] - output[i - 1]));
      expect(jump).toBeLessThan(0.07);
      const afterFade = Math.ceil((changedAt + 0.012) * rate);
      if (action === "stop" || action === "volume") {
        expect(output.slice(afterFade).every((v) => Math.abs(v) < 1e-6)).toBe(
          true,
        );
      } else
        expect(
          output
            .slice(afterFade, afterFade + 480)
            .some((v) => Math.abs(v) > 0.5),
        ).toBe(true);
      sound.dispose();
    },
  );
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
