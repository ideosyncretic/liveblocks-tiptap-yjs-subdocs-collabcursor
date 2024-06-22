import {
  type LiveList,
  // type LiveMap,
  type LiveObject,
} from "@liveblocks/client";

// Presence represents the properties that exist on every user in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
type Presence = {
  // cursor: { x: number, y: number } | null,
  // ...
};

type Card = LiveObject<{
  id: string;
}>;

type List = LiveObject<{
  id: string;
  cards: LiveList<Card>;
}>;

// Optionally, Storage represents the shared document that persists in the
// Room, even after all users leave. Fields under Storage typically are
// LiveList, LiveMap, LiveObject instances, for which updates are
// automatically persisted and synced to all connected clients.
type Storage = {
  lists: LiveList<List>;
};

// Optionally, UserMeta represents static/readonly metadata on each user, as
// provided by your own custom auth back end (if used). Useful for data that
// will not change during a session, like a user's name or avatar.
type UserMeta = {
  // id?: string,  // Accessible through `user.id`
  info?: {
    name: string;
    avatar: string;
  }; // Accessible through `user.info`
};

// Optionally, the type of custom events broadcast and listened to in this
// room. Use a union for multiple events. Must be JSON-serializable.
type RoomEvent = {
  // type: "NOTIFICATION",
  // ...
};

// Optionally, when using Comments, ThreadMetadata represents metadata on
// each thread. Can only contain booleans, strings, and numbers.
export type ThreadMetadata = {
  // resolved: boolean;
  // quote: string;
  // time: number;
};

declare global {
  // For more information, see https://liveblocks.io/docs/api-reference/liveblocks-client#TypeScript
  interface Liveblocks {
    Presence: Presence;
    Storage: Storage;
    UserMeta: UserMeta;
    RoomEvent: RoomEvent;
    ThreadMetadata: ThreadMetadata;
  }
}
