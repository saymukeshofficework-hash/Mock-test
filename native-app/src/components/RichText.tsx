import React from "react";
import { View, useWindowDimensions } from "react-native";
import { SvgXml } from "react-native-svg";
import { mathText } from "@/lib/mathText";
import { Txt } from "./ui";

/** Question/option text. A value that is an inline SVG (figure questions) is drawn as a picture. */
export function RichText({ value, size = 16, w = "regular", color, maxSvgWidth }: { value: string; size?: number; w?: "regular" | "medium" | "semibold" | "bold"; color?: string; maxSvgWidth?: number }) {
  const { width } = useWindowDimensions();
  const v = (value ?? "").trim();
  if (v.startsWith("<svg")) {
    const wMax = Math.min(maxSvgWidth ?? width - 64, 360);
    return (
      <View style={{ width: wMax, aspectRatio: svgAspect(v), backgroundColor: "#fff", borderRadius: 6 }} accessibilityLabel="figure">
        <SvgXml xml={v} width="100%" height="100%" />
      </View>
    );
  }
  return <Txt size={size} w={w} color={color} selectable={false}>{mathText(v)}</Txt>;
}

export function svgAspect(xml: string): number {
  const vb = /viewBox\s*=\s*"([\d.\s-]+)"/.exec(xml);
  if (vb?.[1]) {
    const p = vb[1].trim().split(/\s+/).map(Number);
    if (p.length === 4 && p[2]! > 0 && p[3]! > 0) return p[2]! / p[3]!;
  }
  return 2;
}
