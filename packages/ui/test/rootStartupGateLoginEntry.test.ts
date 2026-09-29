import assert from "node:assert/strict";
import test from "node:test";
import {
  shouldEnableProviderAvailabilityLoginEntryGuard,
  shouldOpenStartupProviderLoginEntry,
} from "../src/lib/rootStartupGate.js";

test("DeepVibe startet ohne erzwungenen Login in den Workspace", () => {
  // 登录可选：启动阶段绝不因缺少账号/Provider 打开登录入口。
  assert.equal(shouldOpenStartupProviderLoginEntry(), false);
  // Guard  bleibt für den Startup-Abschluss (startupCheckCompleted) aktiv.
  assert.equal(shouldEnableProviderAvailabilityLoginEntryGuard(), true);
});
