# Prosemirror Async Query

![](https://badgen.net/bundlephobia/min/prosemirror-async-query)
![](https://badgen.net/npm/v/prosemirror-async-query)

A simple declarative API for using promises in prosemirror plugin state.

[Live Demo](https://prosemirror-async-query.vercel.app/)

## Installation

```sh
# npm
npm install prosemirror-async-query

# yarn
yarn add prosemirror-async-query
```

## Documentation

Coming Soon...

## Usage

```tsx
import { AsyncQuery } from "prosemirror-async-query";
import { Plugin, PluginKey } from "prosemirror-state";

const exampleExtension = new Plugin({
  key: new PluginKey("async-example"),
  view(editor) {
    const pluginKey = this.key;
    return {
      update(editor, oldState) {
        const next = pluginKey.getState(editor.state);
        const prev = pluginKey.getState(oldState);
        const { query, queryResult } = next ?? {};

        // run the query update step but skip update for canceled
        // and loading queries
        query?.viewUpdate(editor, {
          ignoreCanceled: true,
          ignoreLoading: true,
        });

        // when the query result changes, do something with it
        if (queryResult && queryResult !== prev?.queryResult) {
          console.log("query data loaded", queryResult);
        }
      },
      destroy() {
        pluginKey.getState(editor.state)?.query?.viewDestroy();
      },
    };
  },
  state: {
    init() {
      return {
        // create an empty initial query
        query: AsyncQuery.empty(),
        queryResult: null,
      };
    },
    apply(tr, prev, oldState, newState) {
      const { query: prevQuery } = prev;
      const pluginKey = this.spec.key;

      // when the query returns successfully set the query result
      if (prevQuery.statusChanged(tr, "success")) {
        return {
          ...prev,
          queryResult: prevQuery.data,
        };
      }

      // get query parameters from the transaction
      const newParameters = getQueryParameters(tr);

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
});

function getQueryParameters(tr) {
  return tr.time;
}
```
