import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import React from "react";
import { AsyncFlowExtension } from "./AsyncFlowExtension";
import { LogsContainer } from "./LogsContainer";

export const SandboxAsyncFlow = () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, AsyncFlowExtension],
    content: `<p>This editor uses queries to implement async behavior. It uses promises to log the last character typed on a 1 second debounce.</p>`,
  });

  return (
    <div className="tiptap">
      <h1>Prosemirror Async Query</h1>
      <p>A simple declarative API for using promises in prosemirror plugin state.</p>
      <p>
        For more info, check the project out on{" "}
        <a href="https://github.com/lukesmurray/prosemirror-async-query">github</a> or{" "}
        <a href="https://www.npmjs.com/package/prosemirror-async-query">npm</a>.
      </p>
      <hr />
      <EditorContent className="editor" editor={editor} />
      <LogsContainer />
    </div>
  );
};
