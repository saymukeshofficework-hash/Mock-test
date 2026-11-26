import React, { Component, type ReactNode } from "react";
import { Text, View, Pressable } from "react-native";

/** Last-resort screen so a render error never leaves the student on a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error("[app] render error", error.message);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F3F5FA" }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#172238", marginBottom: 8 }}>कुछ गलत हो गया · Something went wrong</Text>
        <Text style={{ color: "#727B8D", textAlign: "center", marginBottom: 16 }}>आपके उत्तर सेव हैं। · Your answers are saved.</Text>
        <Pressable onPress={() => this.setState({ error: null })} style={{ backgroundColor: "#19336F", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>फिर कोशिश करें · Try again</Text>
        </Pressable>
      </View>
    );
  }
}
