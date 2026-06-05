import assert from "node:assert/strict";
import test from "node:test";

import {
  createRoleAccess,
  createAccessFromContract,
  getActionState,
  getBlockedActions,
  getVisibleActions,
  getVisibleNavigation
} from "./permissions.ts";

test("OWNER can open every workspace and owner-only actions", () => {
  const owner = createRoleAccess("OWNER");

  assert.deepEqual(
    getVisibleNavigation(owner).map((workspace) => workspace.id),
    ["catalog", "files", "payments", "admission", "visa", "reports", "users", "commissions"]
  );
  assert.equal(getActionState(owner, "manage-catalog").hidden, false);
  assert.equal(getActionState(owner, "manage-users").hidden, false);
  assert.equal(getActionState(owner, "enter-commission").hidden, false);
});

test("CONSULTANT gets assigned-file navigation and no owner-only controls", () => {
  const consultant = createRoleAccess("CONSULTANT");

  assert.deepEqual(
    getVisibleNavigation(consultant).map((workspace) => workspace.id),
    ["catalog", "files", "reports"]
  );
  assert.equal(getActionState(consultant, "create-student-file").disabled, false);
  assert.equal(getActionState(consultant, "manage-catalog").hidden, true);
  assert.equal(getActionState(consultant, "manage-users").hidden, true);
  assert.equal(getVisibleActions(consultant).some((action) => action.id === "enter-commission"), false);
});

test("ACCOUNTS can confirm payments but cannot approve admission or visa stages", () => {
  const accounts = createRoleAccess("ACCOUNTS");

  assert.deepEqual(
    getVisibleNavigation(accounts).map((workspace) => workspace.id),
    ["files", "payments", "reports"]
  );
  assert.equal(getActionState(accounts, "confirm-payment").disabled, false);
  assert.equal(getActionState(accounts, "approve-admission").disabled, true);
  assert.equal(getActionState(accounts, "record-visa-outcome").disabled, true);
  assert.deepEqual(
    getBlockedActions(accounts).map((action) => action.id),
    ["create-student-file", "approve-admission", "record-visa-outcome"]
  );
});

test("department roles only get their own stage approval", () => {
  const admission = createRoleAccess("ADMISSION");
  const visa = createRoleAccess("VISA");

  assert.equal(getActionState(admission, "approve-admission").disabled, false);
  assert.equal(getActionState(admission, "record-visa-outcome").disabled, true);
  assert.equal(getActionState(visa, "approve-admission").disabled, true);
  assert.equal(getActionState(visa, "record-visa-outcome").disabled, false);
});

test("GET /auth/me contract data maps into frontend permission keys", () => {
  const currentUser = createAccessFromContract({
    user: {
      id: "user-accounts",
      email: "accounts@example.com",
      name: "Accounts User",
      role: "ACCOUNTS"
    },
    permissions: [
      { resource: "files", action: "read", scope: "all" },
      { resource: "payments", action: "read", scope: "financial" },
      { resource: "payments", action: "confirm", scope: "financial" },
      { resource: "reports", action: "read", scope: "financial" }
    ],
    workspaces: [
      { id: "files", label: "Files", allowed: true },
      { id: "payments", label: "Payments", allowed: true },
      { id: "reports", label: "Reports", allowed: true },
      { id: "admission", label: "Admission", allowed: false }
    ]
  });

  assert.equal(currentUser.name, "Accounts User");
  assert.deepEqual(currentUser.permissions, [
    "files.view_all",
    "payments.view",
    "payments.confirm",
    "reports.view_limited"
  ]);
  assert.deepEqual(
    getVisibleNavigation(currentUser).map((workspace) => workspace.id),
    ["files", "payments", "reports"]
  );
});
