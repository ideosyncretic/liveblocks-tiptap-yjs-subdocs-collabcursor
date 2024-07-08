import { Extension } from "@tiptap/core";
import { DecorationAttrs } from "@tiptap/pm/view";
import { defaultSelectionBuilder, yCursorPlugin } from "y-prosemirror";

type CollaborationCursorStorage = {
  users: { clientId: number; [key: string]: any }[];
};

export interface CollaborationCursorOptions {
  provider: any;
  user: Record<string, any>;
  render(user: Record<string, any>, currentEditorID: string): HTMLElement;
  selectionRender(
    user: Record<string, any>,
    currentEditorID: string
  ): DecorationAttrs;
  onUpdate?: (users: { clientId: number; [key: string]: any }[]) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    collaborationCursor: {
      updateUser: (attributes: Record<string, any>) => ReturnType;
      user: (attributes: Record<string, any>) => ReturnType;
    };
  }
}

const awarenessStatesToArray = (states: Map<number, Record<string, any>>) => {
  return Array.from(states.entries()).map(([key, value]) => {
    return {
      clientId: key,
      ...value.user,
    };
  });
};

const defaultOnUpdate = () => null;

export const CollaborationCursor = Extension.create<
  CollaborationCursorOptions,
  CollaborationCursorStorage
>({
  name: "collaborationCursor",

  addOptions() {
    return {
      provider: null,
      user: {
        name: null,
        color: null,
        editorID: null,
      },
      render: (user, currentEditorID) => {
        console.group("render");
        console.log("currentEditorID: ", currentEditorID);
        console.log("user.editorID: ", user.editorID);
        console.log("should render: ", user.editorID === currentEditorID);
        console.groupEnd();
        if (user.editorID !== currentEditorID) {
          return document.createElement("span"); // Return empty span if not matching
        }

        const cursor = document.createElement("span");
        cursor.classList.add("collaboration-cursor__caret");
        cursor.setAttribute("style", `border-color: ${user.color}`);

        const label = document.createElement("div");
        label.classList.add("collaboration-cursor__label");
        label.setAttribute("style", `background-color: ${user.color}`);
        label.insertBefore(document.createTextNode(user.name), null);
        cursor.insertBefore(label, null);

        return cursor;
      },
      selectionRender: (user, currentEditorID) => {
        if (user.editorID !== currentEditorID) {
          return {}; // Return empty object if not matching
        }

        return defaultSelectionBuilder(user);
      },
      onUpdate: defaultOnUpdate,
    };
  },

  onCreate() {
    if (this.options.onUpdate !== defaultOnUpdate) {
      console.warn(
        '[tiptap warn]: DEPRECATED: The "onUpdate" option is deprecated. Please use `editor.storage.collaborationCursor.users` instead. Read more: https://tiptap.dev/api/extensions/collaboration-cursor'
      );
    }
  },

  addStorage() {
    return {
      users: [],
    };
  },

  addCommands() {
    return {
      updateUser: (attributes) => () => {
        this.options.user = { ...this.options.user, ...attributes };

        this.options.provider.awareness.setLocalStateField(
          "user",
          this.options.user
        );

        return true;
      },
      user:
        (attributes) =>
        ({ editor }) => {
          console.warn(
            '[tiptap warn]: DEPRECATED: The "user" command is deprecated. Please use "updateUser" instead. Read more: https://tiptap.dev/api/extensions/collaboration-cursor'
          );

          return editor.commands.updateUser(attributes);
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      yCursorPlugin(
        (() => {
          this.options.provider.awareness.setLocalStateField(
            "user",
            this.options.user
          );

          this.storage.users = awarenessStatesToArray(
            this.options.provider.awareness.states
          );

          this.options.provider.awareness.on("update", () => {
            this.storage.users = awarenessStatesToArray(
              this.options.provider.awareness.states
            );
          });

          return this.options.provider.awareness;
        })(),
        {
          cursorBuilder: (user) =>
            this.options.render(user, this.options.user.editorID),
          selectionBuilder: (user) =>
            this.options.selectionRender(user, this.options.user.editorID),
        }
      ),
    ];
  },
});
