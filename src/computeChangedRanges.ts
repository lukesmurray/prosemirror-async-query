import { Range } from "@tiptap/react";
import memoizeOne from "memoize-one";
import { Transaction } from "prosemirror-state";

/**
 * @returns Whether the change is an insertion or a deletion and the ranges
 * of the changes
 */
function computeChangedRangesInner(transaction: Transaction) {
  const changedRanges: Range[] = [];
  let isInsertion = false;
  let isDeletion = false;
  // from https://discuss.prosemirror.net/t/how-to-calculate-the-changed-ranges-for-transactions/3771/4
  transaction.mapping.maps.forEach((stepMap) => {
    stepMap.forEach((_, __, newFrom, newTo) => {
      if (newFrom === newTo) {
        isDeletion = true;
      } else {
        isInsertion = true;
      }
      changedRanges.push({
        from: newFrom,
        to: newTo,
      });
    });
  });
  return { changedRanges, isInsertion, isDeletion };
}

/**
 * Compute the changed ranges for a transaction. Memoized to avoid
 * re-computing the same ranges for the same transaction.
 */
export const computeChangedRanges = memoizeOne(computeChangedRangesInner);
