import { Pt, Group } from "./Pt";
export declare type ColorType = "rgb" | "hsl" | "hsb" | "lab" | "lch" | "luv" | "xyz";
/**
 * Color is a subclass of Pt. You can think of a color as a point in a color space. The Color class provides support for many color spaces.
 */
export declare class Color extends Pt {
    private static D65;
    protected _mode: ColorType;
    private _isNorm;
    /**
     * Value range for each color space
     */
    static ranges: {
        [name: string]: Group;
    };
    /**
     * Create a Color. Same as creating a Pt.
     * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
     */
    constructor(...args: any[]);
    /**
     * Create a Color object with defaults to 4 dimensions
     * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
     */
    static from(...args: any[]): Color;
    /**
     * Convert a rgb hex string like #FF0000 or #F00 to a Color object
     * @param hex a hex string, with optional '#' prefix
     */
    static fromHex(hex: string): Color;
    /**
     * Create RGB Color
     * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
     */
    static rgb(...args: any[]): Color;
    /**
     * Create HSL Color
     * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
     */
    static hsl(...args: any[]): Color;
    /**
     * Create HSB Color
     * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
     */
    static hsb(...args: any[]): Color;
    /**
     * Create LAB Color
     * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
     */
    static lab(...args: any[]): Color;
    /**
     * Create LCH Color
     * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
     */
    static lch(...args: any[]): Color;
    /**
     * Create LUV Color
     * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
     */
    static luv(...args: any[]): Color;
    /**
     * Create XYZ Color
     * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
     */
    static xyz(...args: any[]): Color;
    /**
     * Get a Color object whose values are the maximum of its mode
     * @param mode a mode string such as "rgb" or "lab"
     * @example Color.maxValue("rgb") will return a rgb Color object with values (255,255,255)
     */
    static maxValues(mode: string): Pt;
    /**
     * Get a hex string such as "#FF0000". Same as `toString("hex")`
     */
    readonly hex: string;
    /**
     * Get a rgb string such as "rgb(255,0,0)". Same as `toString("rgb")`
     */
    readonly rgb: string;
    /**
     * Get a rgba string such as "rgb(255,0,0,0.5)". Same as `toString("rgba")`
     */
    readonly rgba: string;
    /**
     * Clone this Color
     */
    clone(): Color;
    /**
     * Convert this color from current color space to another color space
     * @param mode a ColorType string: "rgb" "hsl" "hsb" "lab" "lch" "luv" "xyz";
     * @param convert if `true`, convert this Color to the new color space specified in `mode`. Default is `false`, which only sets the color mode without converting color values.
     */
    toMode(mode: ColorType, convert?: boolean): this;
    /**
     * Get this Color's mode
     */
    readonly mode: ColorType;
    r: number;
    g: number;
    b: number;
    h: number;
    s: number;
    l: number;
    a: number;
    c: number;
    u: number;
    v: number;
    /**
     * Get alpha value
     */
    readonly alpha: number;
    /**
     * Normalize the color values to between 0 to 1, or revert it back to the min/max values in current color mode
     * @param toNorm a boolean value specifying whether to normalize (`true`) or revert (`false`)
     */
    normalize(toNorm?: boolean): Color;
    /**
     * Like `normalize()` but returns as a new Color
     * @param toNorm a boolean value specifying whether to normalize (`true`) or revert (`false`)
     * @returns new Color
     */
    $normalize(toNorm?: boolean): Color;
    /**
     * Convert this Color to a string. It can be used to get a hex or rgb string for use in rendering
     * @param format "hex", "rgb", "rgba", or "mode" which means using current color mode label. Default is "mode".
     */
    toString(format?: ("hex" | "rgb" | "rgba" | "mode")): string;
    /**
     * Convert RGB to HSL
     * @param rgb a RGB Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new HSL Color
     */
    static RGBtoHSL(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert HSL to RGB
     * @param hsl a HSL Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new RGB Color
     */
    static HSLtoRGB(hsl: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert RGB to HSB
     * @param rgb a RGB Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new HSB Color
     */
    static RGBtoHSB(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert HSB to RGB
     * @param hsb a HSB Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new RGB Color
     */
    static HSBtoRGB(hsb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
   * Convert RGB to LAB
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LAB Color
   */
    static RGBtoLAB(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert LAB to RGB
     * @param lab a LAB Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new RGB Color
     */
    static LABtoRGB(lab: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert RGB to LCH
     * @param rgb a RGB Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new LCH Color
     */
    static RGBtoLCH(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert LCH to RGB
     * @param lch a LCH Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new RGB Color
     */
    static LCHtoRGB(lch: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert RGB to LUV
     * @param rgb a RGB Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new LUV Color
     */
    static RGBtoLUV(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert LUV to RGB
     * @param rgb a RGB Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new RGB Color
     */
    static LUVtoRGB(luv: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert RGB to XYZ
     * @param rgb a RGB Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new XYZ Color
     */
    static RGBtoXYZ(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert XYZ to RGB
     * @param xyz a XYZ Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new RGB Color
     */
    static XYZtoRGB(xyz: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert XYZ to LAB
     * @param xyz a XYZ Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new LAB Color
     */
    static XYZtoLAB(xyz: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert LAB to XYZ
     * @param lab a LAB Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new XYZ Color
     */
    static LABtoXYZ(lab: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert XYZ to LUV
     * @param xyz a XYZ Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new LUV Color
     */
    static XYZtoLUV(xyz: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert LUV to XYZ
     * @param luv a LUV Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new XYZ Color
     */
    static LUVtoXYZ(luv: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert LAB to LCH
     * @param lab a LAB Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new LCH Color
     */
    static LABtoLCH(lab: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    /**
     * Convert LCH to LAB
     * @param lch a LCH Color
     * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
     * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
     * @returns a new LAB Color
     */
    static LCHtoLAB(lch: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
}
