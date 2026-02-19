import { useState } from "react";
import type { LayoutMode } from "../types";

export function useLayoutState() {
  const [layout, setLayout] = useState<LayoutMode>("grid");
  return { layout, setLayout };
}
