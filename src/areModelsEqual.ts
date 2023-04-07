import {} from "jest";
import { Model } from "./engine";

function areModelsEqual(a: unknown, b: unknown): boolean | undefined {
  const isAModule = a instanceof Model;
  const isBModule = b instanceof Model;

  if (isAModule && isBModule) {
    // @ts-expect-error
    return this.equals(a, b);
  } else if (isAModule !== isBModule) {
    return false;
  } else {
    return undefined;
  }
}

// @ts-expect-error
expect.addEqualityTesters([areModelsEqual]);
