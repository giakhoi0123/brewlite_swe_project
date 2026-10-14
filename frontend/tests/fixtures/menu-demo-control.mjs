// Test/demo tool only: writes isolated HTTP fixture controls, never database data.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { sampleProducts } from "../../../backend/prisma/seed-products.ts";

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const argumentsWithoutFlags = process.argv.slice(2).filter((value) => !value.startsWith("--"));
const mode = argumentsWithoutFlags[0] ?? "success";
const output = resolve(argumentsWithoutFlags[1] ?? resolve(workspace, "tmp/tri09/control.json"));
if (!output.startsWith(resolve(workspace, "tmp") + sep)) throw new Error("Control file must stay in workspace/tmp");
const body = sampleProducts.map(({ id, name, price, imageUrl }) => ({ id, name, price, imageUrl }));
const plan = { status: 200, body };
switch (mode) {
  case "success": break;
  case "loading": plan.hold = true; break;
  case "empty": plan.body = []; break;
  case "error": plan.status = 500; plan.body = { message: "Test-only internal error" }; break;
  case "network": plan.networkError = true; break;
  case "invalid": plan.body = { data: body }; break;
  case "edge":
    plan.body[0] = { ...body[0], name: "Tên đồ uống rất dài " + "BrewLite".repeat(18), imageUrl: "/images/products/test-missing.svg", price: 0 };
    plan.body[1] = { ...body[1], price: 2147483647 };
    break;
  default: throw new Error("Mode: success | loading | empty | error | network | invalid | edge");
}
if (process.argv.includes("--auth")) {
  plan.authResult = {
    user: { id: "tri09-ui-only", name: "Tài khoản kiểm thử TRI-09", email: "tri09@example.invalid", loyaltyPoints: 0 },
    accessToken: "test-fixture-not-a-valid-jwt",
  };
}
await mkdir(dirname(output), { recursive: true });
// Atomic rename avoids a partially written JSON response during a running request.
const temporary = output + ".new";
await writeFile(temporary, JSON.stringify(plan, null, 2));
const { rename } = await import("node:fs/promises");
await rename(temporary, output);
console.log(`Test-only ${mode} controls: ${output}`);
