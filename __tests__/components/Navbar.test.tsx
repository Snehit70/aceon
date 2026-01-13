// @bun
import { describe, test, expect, mock, beforeAll } from "bun:test";
import React from "react";
import { render } from "@testing-library/react";
import { Navbar } from "@/components/shared/navbar";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Setup Happy DOM
beforeAll(() => {
  GlobalRegistrator.register();
});

// Mock next/navigation
mock.module("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock Clerk
// Defining components outside to avoid potential parsing issues with JSX inside the mock factory
const MockChildren = ({ children }) => React.createElement(React.Fragment, null, children);
const MockButton = ({ children }) => React.createElement("div", null, children);
const MockUserButton = () => React.createElement("div", null, "UserButton");

mock.module("@clerk/nextjs", () => ({
  SignedIn: MockChildren,
  SignedOut: MockChildren,
  SignInButton: MockButton,
  UserButton: MockUserButton,
}));

describe("Navbar Component", () => {
    // Basic snapshot test
    test("renders correctly", () => {
        const { container } = render(React.createElement(Navbar, null));
        expect(container).toBeTruthy();
    });
});
