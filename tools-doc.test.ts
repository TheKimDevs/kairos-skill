import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"
import { z } from "zod"

import { TOOL_INPUTS } from "@kairos/core/tools"

/**
 * Drift guard for the hand-written references/tools.md: unlike the CLI
 * (which imports TOOL_INPUTS), the skill doc shares no code with core, so
 * this test pins it to the manifest. Add a tool or an enum value without
 * documenting it and this fails.
 */
const doc = readFileSync(
  fileURLToPath(new URL("./references/tools.md", import.meta.url)),
  "utf8"
)

function collectEnumValues(schema: unknown, into: Set<string>): void {
  if (schema == null || typeof schema !== "object") return
  const node = schema as Record<string, unknown>
  if (Array.isArray(node.enum)) {
    for (const value of node.enum) {
      if (typeof value === "string") into.add(value)
    }
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) collectEnumValues(item, into)
    } else if (typeof value === "object") {
      collectEnumValues(value, into)
    }
  }
}

describe("references/tools.md stays in sync with TOOL_INPUTS", () => {
  it("documents every tool name", () => {
    const missing = Object.keys(TOOL_INPUTS).filter(
      (name) => !doc.includes(name)
    )
    expect(missing).toEqual([])
  })

  it("documents every enum value used by a tool payload", () => {
    const values = new Set<string>()
    for (const schema of Object.values(TOOL_INPUTS)) {
      collectEnumValues(
        z.toJSONSchema(schema, { io: "input", unrepresentable: "any" }),
        values
      )
    }
    expect(values.size).toBeGreaterThan(0)
    const missing = [...values].filter((value) => !doc.includes(value))
    expect(missing).toEqual([])
  })
})
