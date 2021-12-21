import { nanoid } from "nanoid";
import type { Transaction } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";

/**
 * The current status of the query.
 * `idle` means the query has been created but has not been run.
 * `loading` means the query has been run but has not returned.
 * `error` means the query was canceled or returned an error.
 * `success` means the query returned successfully.
 */
export type QueryStatus = "idle" | "loading" | "error" | "success";

/**
 * A key that can be passed to `setMeta` or `getMeta` on transactions.
 * Can be a string, pluginkey, or plugin.
 */
export type MetaKey = Parameters<Transaction["setMeta"]>[0];

/**
 * Options passed to the AsyncQuery Constructor
 */
export type AsyncQueryOptions<P, D> = {
  /**
   * The key used to `setMeta` and `getMeta` on transactions.
   */
  metaKey?: MetaKey;
  /**
   * Arbitrary parameters associated with the query. You can use this as a bucket
   * to store values with the query, or to implement a caching strategy and
   * determine if two queries are the same.
   */
  parameters?: P;
  /**
   * The query function
   */
  query?: () => Promise<D>;
  /**
   * The cancel function, used to cancel the query.
   */
  cancel?: () => void;
  /**
   * Whether the query is enabled.
   */
  enabled?: boolean;
  /**
   * The unique id for the query.
   */
  queryId?: string;
};

/**
 * Options passed to AsyncQuery.viewUpdate
 * @see {AsyncQuery.viewUpdate}
 */
export type AsyncQueryViewUpdateOptions = {
  /**
   * If true the query will not dispatch a transaction for `canceled` queries
   */
  ignoreCanceled?: boolean;
  /**
   * If true the query will not dispatch a transaction for `successful` queries
   */
  ignoreSuccess?: boolean;
  /**
   * If true the query will not dispatch a transaction for `error` queries.
   *
   * Note: all canceled queries are errors, but not all errors are canceled.
   * You can determine if a query was canceled by checking that both the `error`
   * property and the `canceled` property are true.
   */
  ignoreError?: boolean;
  /**
   * If true the query will not dispatch a transaction for `loading` queries
   */
  ignoreLoading?: boolean;
};

/**
 * AsyncQuery is a helper class for handling asynchronous functions in ProseMirror.
 * The basic logic idea is that you pass an async function to the query in apply.
 * You then run `viewUpdate` and`viewDestroy` in the state update/destroy functions.
 * The query will dispatch transactions when the async update is finished.
 * You can handle these transactions in apply using statusChanged()
 * and use them to build state to display in update.
 */
export class AsyncQuery<P = any, D = any> {
  /**
   * @see {AsyncQueryOptions.enabled}
   */
  public enabled: boolean;
  /**
   * @see {AsyncQueryOptions.parameters}
   */
  public parameters: P | undefined;
  /**
   * @see {AsyncQueryOptions.metaKey}
   */
  public readonly metaKey: MetaKey;
  /**
   * @see {AsyncQueryOptions.queryId}
   */
  public readonly queryId: string;

  private _canceled: boolean;
  private _data: D | undefined;
  private _error: any | undefined;
  private _status: QueryStatus;
  private cancelFn: (() => void) | undefined;
  private queryFn: () => Promise<D>;

  /**
   * @see {QueryStatus}
   */
  public get status() {
    return this._status;
  }

  /**
   * The data returned by the query
   */
  public get data() {
    return this._data;
  }

  /**
   * The error returned by the query
   */
  public get error() {
    return this._error;
  }

  /**
   * Whether the query was canceled.
   */
  public get canceled() {
    return this._canceled;
  }

  /**
   * String representation of the query
   */
  public toString() {
    return `Query(${this.parameters}) { status: ${this.status}, canceled: ${this.canceled}, enabled: ${this.enabled} }`;
  }

  /**
   * Create a new AsyncQuery
   *
   * @see {AsyncQueryOptions}
   */
  constructor({ metaKey, parameters, query, cancel, enabled, queryId }: AsyncQueryOptions<P, D>) {
    this._status = "idle";
    this.queryFn = query ?? (() => Promise.resolve() as any);
    this.cancelFn = cancel;
    this.parameters = parameters;
    this._canceled = false;
    this.metaKey = metaKey ?? nanoid();
    this.queryId = queryId ?? nanoid();
    this.enabled = enabled ?? true;
  }

  /**
   * Run the query, setting the query's data, status, error, and canceled
   * appropriately.
   *
   * @returns Promise that resolves when the query function returns or when the
   * query is canceled.
   */
  public async run() {
    if (this.enabled === false) {
      return;
    }
    this._status = "loading";
    this._canceled = false;
    return this.queryFn()
      .then((res) => {
        if (this._canceled) {
          throw new Error("Canceled");
        }
        this._data = res;
        this._status = "success";
      })
      .catch((err) => {
        this._status = "error";
        this._error = err;
      });
  }

  /**
   * Cancel the query
   */
  public cancel() {
    if (this._status === "loading") {
      this._status = "error";
      this._canceled = true;
      this._error = new Error("Canceled");
      this.cancelFn?.();
    }
  }

  /**
   * Method meant to be called in a prosemirror plugin's view.update method.  If
   * the query idle this method runs the query and will dispatch transactions
   * indicating changes to the query status such as `loading`, `error`, and
   * `success`.
   *
   * This function only runs the query function if the query is `idle` and is
   * `enabled`.
   *
   * You can pass options to suppress transactions associated with certain updates.
   * For example you can ignore `loading` and `canceled` queries by passing
   * `{ignoreLoading: true, ignoreCanceled: true}`.
   */
  public viewUpdate(
    editor: EditorView,
    {
      ignoreCanceled = false,
      ignoreError = false,
      ignoreLoading = false,
      ignoreSuccess = false,
    }: AsyncQueryViewUpdateOptions = {},
  ) {
    if (this.enabled === false) {
      return;
    }
    if (this.status === "idle") {
      // run all idle queries
      this.run().finally(() => {
        if (this._canceled && ignoreCanceled) {
          return;
        }
        if (this.status === "success" && ignoreSuccess) {
          return;
        }

        if (this.status === "error" && ignoreError) {
          return;
        }

        const transaction = editor.state.tr;
        transaction.setMeta("addToHistory", false);
        transaction.setMeta(this.metaKey, {
          queryId: this.queryId,
        });
        editor.dispatch(transaction);
      });

      if (ignoreLoading) {
        return;
      }

      // send loading updates
      const transaction = editor.state.tr;
      transaction.setMeta("addToHistory", false);
      transaction.setMeta(this.metaKey, {
        queryId: this.queryId,
      });
      editor.dispatch(transaction);
    }
  }

  /**
   * Method meant to be called in a prosemirror plugin's view.destory method.
   * This method cancels any running queries.
   */
  public viewDestroy() {
    this.cancel();
  }

  /**
   * Method meant to be called in a prosemirror plugin's state.apply method.
   *
   * This method checks the transaction to see if it is a transaction dispatched
   * from the viewUpdate method.
   *
   * You can filter transactions by passing a status string or array.
   * If status equals `success` the method will only return true for transactions
   * where the query successfully returned.
   *
   * If status equals [`success`, `error`] the method will only return true for
   * transactions where the query returned successfully or threw an error.
   *
   */
  public statusChanged(tr: Transaction, status?: QueryStatus | QueryStatus[]): boolean {
    let reportChange = tr.getMeta(this.metaKey)?.queryId === this.queryId;
    if (typeof status === "string") {
      reportChange = this.status === status && reportChange;
    } else if (Array.isArray(status)) {
      reportChange = status.indexOf(this.status) !== -1 && reportChange;
    }
    return reportChange;
  }

  /**
   * Create an empty query that is disabled. This query will not do anything
   * but can be useful for setting initial prosemirror plugin state in state.init.
   */
  public static empty() {
    return new AsyncQuery({
      enabled: false,
    });
  }
}
