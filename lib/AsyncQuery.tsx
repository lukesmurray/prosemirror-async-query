import { nanoid } from "nanoid";
import type { Transaction } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";

export type QueryStatus = "empty" | "idle" | "loading" | "error" | "success";
export type MetaKey = Parameters<Transaction["setMeta"]>[0];

/**
 * AsyncQuery is a helper class for handling asynchronous functions in ProseMirror.
 * The basic logic idea is that you pass an async function to the query in apply.
 * You then run `viewUpdate` and`viewDestroy` in the state update/destroy functions.
 * The query will dispatch transactions when the async update is finished.
 * You can handle these transactions in apply using statusChanged()
 * and use them to build state to display in update.
 */
export class AsyncQuery<P = any> {
  public readonly metaKey: MetaKey;
  public readonly parameters: P | undefined;
  public readonly queryId: string;
  public enabled: boolean;

  private _canceled: boolean;
  private _data: any;
  private _error: any;
  private _status: QueryStatus;
  private cancelFn: (() => void) | undefined;
  private queryFn: () => Promise<any>;

  public get status() {
    return this._status;
  }

  public get data() {
    return this._data;
  }

  public get error() {
    return this._error;
  }

  public get canceled() {
    return this._canceled;
  }

  public toString() {
    return `Query(${this.parameters}) { status: ${this.status}, canceled: ${this.canceled}, enabled: ${this.enabled} }`;
  }

  constructor({
    metaKey,
    parameters,
    query,
    cancel,
    enabled,
    queryId,
  }: {
    metaKey?: MetaKey;
    parameters?: P;
    query?: () => Promise<any>;
    cancel?: () => void;
    enabled?: boolean;
    queryId?: string;
  }) {
    this._status = "idle";
    this.queryFn = query ?? (() => Promise.resolve());
    this.cancelFn = cancel;
    this.parameters = parameters;
    this._canceled = false;
    this.metaKey = metaKey ?? nanoid();
    this.queryId = queryId ?? nanoid();
    this.enabled = enabled ?? true;
  }

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

  public cancel() {
    if (this._status === "loading") {
      this._status = "error";
      this._canceled = true;
      this._error = new Error("Canceled");
      this.cancelFn?.();
    }
  }

  public viewUpdate(
    editor: EditorView,
    {
      ignoreCanceled = false,
      ignoreError = false,
      ignoreLoading = false,
      ignoreSuccess = false,
    }: {
      ignoreCanceled?: boolean;
      ignoreSuccess?: boolean;
      ignoreError?: boolean;
      ignoreLoading?: boolean;
    } = {},
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

  public viewDestroy() {
    this.cancel();
  }

  public statusChanged(tr: Transaction, status?: QueryStatus | QueryStatus[]): boolean {
    let reportChange = tr.getMeta(this.metaKey)?.queryId === this.queryId;
    if (typeof status === "string") {
      reportChange = this.status === status && reportChange;
    } else if (Array.isArray(status)) {
      reportChange = status.indexOf(this.status) !== -1 && reportChange;
    }
    return reportChange;
  }

  public static empty() {
    return new AsyncQuery({
      enabled: false,
    });
  }
}
