/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bookmarks from "../bookmarks.js";
import type * as courses from "../courses.js";
import type * as debug from "../debug.js";
import type * as debug_content from "../debug_content.js";
import type * as debug_orphans from "../debug_orphans.js";
import type * as progress from "../progress.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as videoNotes from "../videoNotes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bookmarks: typeof bookmarks;
  courses: typeof courses;
  debug: typeof debug;
  debug_content: typeof debug_content;
  debug_orphans: typeof debug_orphans;
  progress: typeof progress;
  seed: typeof seed;
  users: typeof users;
  videoNotes: typeof videoNotes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
