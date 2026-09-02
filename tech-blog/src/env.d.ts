/// <reference path="../.astro/types.d.ts" />

declare module '*.md?raw' {
  const content: string;
  export default content;
}