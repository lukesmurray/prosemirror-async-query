import { Extension, Range } from "@tiptap/react";
import { EditorState, Plugin, PluginKey, Transaction } from "prosemirror-state";
import invariant from "tiny-invariant";
import { AsyncQuery } from "../lib/AsyncQuery";
import { computeChangedRanges } from "./computeChangedRanges";

interface AsyncFlowPluginState {
  query: AsyncQuery<string, string>;
  queryResult: null | string;
}

export const AsyncFlowExtension = Extension.create({
  name: "async-flow",
  addProseMirrorPlugins() {
    const self = this; // eslint-disable-line @typescript-eslint/no-this-alias
    return [
      new Plugin<AsyncFlowPluginState>({
        key: new PluginKey(self.name),
        view(editor) {
          const pluginKey = this.key;
          invariant(pluginKey);
          return {
            update(editor, oldState) {
              const next = pluginKey.getState(editor.state);
              const prev = pluginKey.getState(oldState);
              const { query, queryResult } = next ?? {};

              // run the query update step
              query?.viewUpdate(editor, {
                ignoreCanceled: true,
                ignoreLoading: true,
              });

              // do something when the query data is loaded
              if (queryResult && queryResult !== prev?.queryResult) {
                console.log("query data loaded", queryResult);
              }
            },
            destroy() {
              // run the query destroy step
              pluginKey.getState(editor.state)?.query?.viewDestroy();
            },
          };
        },
        state: {
          init() {
            return {
              query: AsyncQuery.empty(),
              queryResult: null,
            };
          },
          apply(tr, prev, oldState, newState) {
            const { query: prevQuery } = prev;
            const pluginKey = this.spec.key;
            invariant(pluginKey);

            if (prevQuery.statusChanged(tr, "success")) {
              return {
                ...prev,
                queryResult: prevQuery.data!,
              };
            }

            // get query parameters from the transaction
            const newParameters = getTypedCharacter(newState, tr);

            // check if the query parameters have changed
            const changed = newParameters && prevQuery.parameters !== newParameters;

            if (!changed) {
              return prev;
            }

            const next = { ...prev };

            if (changed) {
              // cancel the previous query
              prevQuery.cancel();

              // create the new query
              const newQuery = new AsyncQuery({
                query: async () => {
                  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
                  await delay(1000);
                  return newParameters;
                },
                metaKey: pluginKey,
                parameters: newParameters,
              });
              next.query = newQuery;
            }

            return next;
          },
        },
      }),
    ];
  },
});

function getTypedCharacter(newState: EditorState, tr: Transaction) {
  const { empty, from, to } = newState.selection;
  const selectionRange: Range = { from, to };
  const changedRanges = computeChangedRanges(tr).changedRanges.filter((cr) => rangeIntersects(cr, selectionRange));
  if (empty && changedRanges.length > 0) {
    const changedText = tr.doc.textBetween(changedRanges[0].from, changedRanges[0].to);
    if (changedText.length > 0) {
      // TODO(lukemurray): this should return a string
      return changedText[changedText.length - 1];
    }
  }
  return null;
}

function rangeIntersects(a: Range, b: Range) {
  return a.from <= b.to && a.to >= b.from;
}
