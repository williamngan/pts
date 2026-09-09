import { describe, expectTypeOf, it } from "vitest";
import type {
  AnimateCallbackFn,
  DefaultFormStyle,
  GroupLike,
  IntersectContext,
  IPlayer,
  PtLike,
  PtLikeIterable,
  UIActionEvent,
  UIHandler,
} from "../Types";
import { type Bound, type Group, type Pt } from "../Pt";
import type { Space } from "../Space";
import type { UI, UIPointerAction } from "../UI";
import type { CanvasForm, CanvasSpace } from "../Canvas";
import type { SVGForm } from "../Svg";

// Type-level pins for the public type contract. These run under vitest's
// typecheck mode: a change that breaks downstream consumers' compiles
// fails here first.

describe("public type contract", () => {
  it("paragraphBox accepts all PtLikeIterable inputs in both renderers", () => {
    type CanvasInput = Parameters<CanvasForm["paragraphBox"]>[0];
    type SVGInput = Parameters<SVGForm["paragraphBox"]>[0];
    expectTypeOf<CanvasInput>().toEqualTypeOf<PtLikeIterable>();
    expectTypeOf<SVGInput>().toEqualTypeOf<CanvasInput>();
    expectTypeOf<number[][]>().toExtend<CanvasInput>();
    expectTypeOf<Float32Array[]>().toExtend<CanvasInput>();
    expectTypeOf<Generator<number[]>>().toExtend<CanvasInput>();
  });

  it("CanvasSpace accepts an omitted or empty mount", () => {
    expectTypeOf<typeof CanvasSpace>().toBeConstructibleWith();
    expectTypeOf<ConstructorParameters<typeof CanvasSpace>[0]>().toEqualTypeOf<
      string | Element | null | undefined
    >();
  });

  it("PtLike accepts Pt, Float32Array, and number[]", () => {
    expectTypeOf<Pt>().toExtend<PtLike>();
    expectTypeOf<Float32Array>().toExtend<PtLike>();
    expectTypeOf<number[]>().toExtend<PtLike>();
    expectTypeOf<string>().not.toExtend<PtLike>();
  });

  it("GroupLike and PtLikeIterable accept the documented shapes", () => {
    expectTypeOf<Group>().toExtend<GroupLike>();
    expectTypeOf<Pt[]>().toExtend<GroupLike>();
    expectTypeOf<Group>().toExtend<PtLikeIterable>();
    expectTypeOf<number[][]>().toExtend<PtLikeIterable>();
    expectTypeOf<Iterable<Pt>>().toExtend<PtLikeIterable>();
  });

  it("UIHandler dispatches the full event union with typed actions", () => {
    type HandlerEvt = Parameters<UIHandler>[3];
    expectTypeOf<MouseEvent>().toExtend<HandlerEvt>();
    expectTypeOf<TouchEvent>().toExtend<HandlerEvt>();
    expectTypeOf<PointerEvent>().toExtend<HandlerEvt>();
    expectTypeOf<KeyboardEvent>().toExtend<HandlerEvt>();
    expectTypeOf<HandlerEvt>().toEqualTypeOf<UIActionEvent>();
    // a permissively-typed handler stays assignable
    const loose = (_t: UI, _p: PtLike, _ty: string, _e: Event) => {};
    expectTypeOf(loose).toExtend<UIHandler>();
    // known action strings narrow, custom strings remain allowed
    expectTypeOf<"drag">().toExtend<Parameters<UIHandler>[2]>();
    expectTypeOf<"my-custom-action">().toExtend<Parameters<UIHandler>[2]>();
    expectTypeOf<UIPointerAction>().toExtend<Parameters<UIHandler>[2]>();
  });

  it("AnimateCallbackFn exposes the typed Space", () => {
    expectTypeOf<Parameters<AnimateCallbackFn>>().toEqualTypeOf<
      [number, number, Space]
    >();
  });

  it("IPlayer callbacks carry the dispatched event types", () => {
    type Action = NonNullable<IPlayer["action"]>;
    expectTypeOf<Parameters<Action>[3]>().toEqualTypeOf<UIActionEvent>();
    type Resize = NonNullable<IPlayer["resize"]>;
    expectTypeOf<Parameters<Resize>[0]>().toEqualTypeOf<Bound>();
  });

  it("DefaultFormStyle uses canvas literal unions", () => {
    expectTypeOf<"round">().toExtend<
      NonNullable<DefaultFormStyle["lineJoin"]>
    >();
    expectTypeOf<"nonsense">().not.toExtend<
      NonNullable<DefaultFormStyle["lineJoin"]>
    >();
    expectTypeOf<"butt">().toExtend<NonNullable<DefaultFormStyle["lineCap"]>>();
  });

  it("IntersectContext.other requires narrowing", () => {
    expectTypeOf<IntersectContext["other"]>().toEqualTypeOf<unknown>();
  });
});
