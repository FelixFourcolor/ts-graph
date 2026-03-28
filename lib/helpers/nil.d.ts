declare const nil: unique symbol;

// Using a distinct type to represent nil in case `null` is a valid value for something else.
export type nil = typeof nil;
