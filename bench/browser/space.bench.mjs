/**
 * `CanvasSpace` and `UI`.
 *
 * The per-frame cost that belongs to Pts rather than to the browser is the
 * player dispatch loop and, in interactive sketches, UI hit-testing on every
 * pointer move. Both are measured here directly rather than through
 * `requestAnimationFrame`, which would measure the browser's frame scheduler.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const PLAYERS = SIZES.S;
const WIDGETS = SIZES.S;
const PROBES = SIZES.M;

export default defineSuite("space", (b, { Pts, fx }) => {
  const { CanvasSpace, UI, UIButton, Group, Pt } = Pts;

  const host = () => {
    const element = document.createElement("div");
    element.style.width = "800px";
    element.style.height = "600px";
    document.body.appendChild(element);
    return element;
  };

  /** A CanvasSpace finishes sizing itself asynchronously; wait for that. */
  const ready = (space) =>
    new Promise((resolve) => {
      const done = () => resolve(space);
      space.element.addEventListener("ready", done, { once: true });
      setTimeout(done, 500);
    });

  b.case("Space player dispatch", {
    batch: PLAYERS,
    setupOnce: async () => {
      const element = host();
      const space = new CanvasSpace(element).setup({ resize: false });
      await ready(space);
      let ticks = 0;
      for (let i = 0; i < PLAYERS; i++) {
        space.add({ animate: () => (ticks += 1) });
      }
      return { element, space, read: () => ticks };
    },
    teardown: (state) => {
      state?.space?.dispose();
      state?.element?.remove();
    },
    // `playItems` is the frame body; calling it directly measures the dispatch
    // loop without the frame scheduler in the way.
    run: ({ space, read }) => {
      space.playItems(16);
      sink(read());
    },
  });

  // The pointer-action dispatch path (`_mouseAction`): per-event cost of
  // delivering a pointer event to every player with an `action` callback.
  b.case("Space pointer-action dispatch", {
    batch: PLAYERS,
    setupOnce: async () => {
      const element = host();
      const space = new CanvasSpace(element).setup({ resize: false });
      await ready(space);
      let acc = 0;
      for (let i = 0; i < PLAYERS; i++) {
        space.add({
          animate: () => {},
          action: (type, px) => (acc += px),
        });
      }
      space.bindMouse();
      space.playItems(16); // actions dispatch only while playing
      return { element, space, read: () => acc };
    },
    teardown: (state) => {
      state?.space?.dispose();
      state?.element?.remove();
    },
    run: ({ space, read }) => {
      space.element.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 50, clientY: 60 }),
      );
      sink(read());
    },
  });

  b.case("Space add / removeAll", {
    batch: PLAYERS,
    setupOnce: async () => {
      const element = host();
      const space = new CanvasSpace(element).setup({ resize: false });
      await ready(space);
      return { element, space };
    },
    teardown: (state) => {
      state?.space?.dispose();
      state?.element?.remove();
    },
    run: ({ space }) => {
      for (let i = 0; i < PLAYERS; i++) space.add({ animate: () => {} });
      const count = Object.keys(space.players).length;
      space.removeAll();
      sink(count);
    },
  });

  // A UI with no handler for the action returns from `listen` before doing any
  // hit testing, so each case registers one — otherwise this measures an early
  // return rather than the geometry.
  b.case("UI.track (hit testing)", {
    batch: PROBES,
    setupOnce: () => {
      let hits = 0;
      const uis = [];
      for (let i = 0; i < WIDGETS; i++) {
        const ui = UI.fromRectangle(
          Group.fromArray([
            [i * 8, i * 4],
            [i * 8 + 60, i * 4 + 30],
          ]),
          {},
          `ui-${i}`,
        );
        ui.on("move", () => (hits += 1));
        uis.push(ui);
      }
      return {
        uis,
        probes: fx.ptLikes("space:probes", PROBES, 2, 0, 700),
        read: () => hits,
      };
    },
    run: ({ uis, probes, read }) => {
      for (let i = 0; i < PROBES; i++) {
        UI.track(uis, "move", probes[i], undefined);
      }
      sink(read() + 1);
    },
  });

  b.case("UIButton hover dispatch", {
    batch: PROBES,
    setupOnce: () => {
      let hits = 0;
      const button = UIButton.fromRectangle(
        Group.fromArray([
          [0, 0],
          [400, 300],
        ]),
        {},
        "button",
      );
      button.onHover(
        () => (hits += 1),
        () => (hits += 1),
      );
      return {
        button,
        probes: fx.ptLikes("space:hover", PROBES, 2, -100, 600),
        read: () => hits,
      };
    },
    run: ({ button, probes, read }) => {
      for (let i = 0; i < PROBES; i++) {
        button.listen("move", probes[i], undefined);
      }
      sink(read() + 1);
    },
  });

  b.case("UI.fromPolygon hit testing", {
    batch: PROBES,
    setupOnce: () => {
      const ui = UI.fromPolygon(
        fx.polygon("space:poly", 8, 200, [300, 300]),
        {},
        "poly",
      );
      ui.on("move", () => {});
      return {
        ui,
        probes: fx.ptLikes("space:poly:probes", PROBES, 2, 0, 600),
      };
    },
    run: ({ ui, probes }) => {
      let inside = 0;
      for (let i = 0; i < PROBES; i++) {
        if (ui.listen("move", probes[i], undefined)) inside += 1;
      }
      sink(inside + 1);
    },
  });

  if (!Pt) throw new Error("Pt export is missing");
});
