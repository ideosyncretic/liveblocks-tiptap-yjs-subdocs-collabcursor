"use client";

import type { BaseUserMeta } from "@liveblocks/core";
import { useEffect, useState } from "react";
import { LiveObject } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import LiveblocksProvider from "@liveblocks/yjs";
import { Stack, Card, Button, Text } from "@mantine/core";

import {
  useMutation,
  useRoom,
  useStorage,
  useStatus,
} from "../../liveblocks.config";
import * as Y from "yjs";
import { createId } from "@paralleldrive/cuid2";
import Editor from "@/components/Editor.component";

export default function DemoPage() {
  return (
    <ClientSideSuspense fallback="Loading...">
      {() => <App />}
    </ClientSideSuspense>
  );
}

function App() {
  // const doc = useMemo(() => new Y.Doc(), []);
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] =
    useState<LiveblocksProvider<never, never, BaseUserMeta, never>>();

  const status = useStatus();
  const [synced, setSynced] = useState(false);

  // Liveblocks Storage
  const lists = useStorage((root) => root.lists);

  useEffect(() => {
    // Initialize Yjs and Liveblocks Provider
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksProvider(room, yDoc, {
      autoloadSubdocs: true,
    });
    setDoc(yDoc);
    setProvider(yProvider);

    // Initialize top-level shared fragment
    yDoc.get("title", Y.XmlFragment);

    // Initialize top-level shared fragment
    yDoc.get("description", Y.XmlFragment);

    return () => {
      setSynced(false);
      yDoc.destroy();
      yProvider.destroy();
    };
  }, [room]);

  useEffect(() => {
    if (!doc || !provider) return;

    // Create a top-level map to store subdocs
    const yListsMap = doc.getMap<Y.Doc>("lists");

    provider.on("sync", () => {
      setSynced(true); // Triggers a rerender. Subdocs wouldn't be able to be loaded in time for rendering otherwise

      // Create subdocument for each List in Liveblocks Storage
      lists?.forEach((list) => {
        // Init List subdoc
        const yListSubdoc = new Y.Doc();

        if (yListsMap.get(list.id) instanceof Y.Doc) {
          console.log("Subdoc already exists:", yListsMap.get(list.id)?.guid);
        } else {
          // If the subdoc doesn't exist yet
          yListsMap.set(list.id, yListSubdoc); // Add it to the map
          console.log("Subdoc created:", yListSubdoc.guid);
        }
      });
    });
  }, [lists, doc, provider, room]);

  const addCard = useMutation(
    // Mutation context is passed as the first argument
    ({ storage }, listId: string) => {
      const lists = storage.get("lists");
      const currentListIndex = lists.findIndex(
        (value) => value.toObject().id === listId
      );
      const currentList = lists.get(currentListIndex);

      const currentListOfCards = currentList?.get("cards");

      const newCard = new LiveObject({
        id: `card-${createId()}`,
      });

      currentListOfCards?.push(newCard);
    },
    []
  );

  const deleteCard = useMutation(
    // Mutation context is passed as the first argument
    ({ storage }, listId: string, cardToDeleteId: string) => {
      const lists = storage.get("lists");

      const currentListIndex = lists.findIndex(
        (list) => list.toObject().id === listId
      );
      const currentList = lists.get(currentListIndex);

      const currentListOfCards = currentList?.get("cards");

      const cardToDeleteIndex = currentListOfCards?.findIndex(
        (card) => card.toObject().id === cardToDeleteId
      );

      if (typeof cardToDeleteIndex !== "number") {
        return;
      }

      currentListOfCards?.delete(cardToDeleteIndex);
    },
    []
  );

  if (!doc || !provider) {
    return null;
  }

  const yListsMap = doc.getMap<Y.Doc>("lists");
  const yListSubdoc = yListsMap.get(lists[0].id);

  console.log("Rendering subdoc:", yListSubdoc?.guid);

  return (
    <Stack m="lg">
      <Stack gap={0}>
        <Text size="sm" pb="xs">
          Connection status: {status}
        </Text>
        <Text size="sm" pb="xs">
          Sync status: {synced ? "Synced" : "Syncing..."}
        </Text>
      </Stack>

      <Stack gap={0}>
        <h4>Board Title</h4>
        <Editor
          fragment={doc.getXmlFragment("title")}
          provider={provider}
          placeholder="Title here"
        />
        <Editor
          fragment={doc.getXmlFragment("description")}
          provider={provider}
          placeholder="Description here"
        />
      </Stack>

      {yListSubdoc &&
        synced &&
        lists.map((list) => {
          return (
            <Card key={list.id} w="400px">
              <Stack>
                <Stack gap={0}>
                  <h4>List</h4>
                  <Editor
                    fragment={yListSubdoc.getXmlFragment("title")}
                    provider={provider}
                    placeholder="Title here"
                  />
                  <Editor
                    fragment={yListSubdoc.getXmlFragment("description")}
                    provider={provider}
                    placeholder="Description here"
                  />
                </Stack>

                <Stack mb="lg" gap="xs">
                  <Text size="xs">List ID: {list.id}</Text>
                  <Text size="xs">Subdoc GUID: {yListSubdoc.guid}</Text>
                </Stack>

                <h4>Cards</h4>
                {list.cards?.map((card) => {
                  return (
                    <Card key={card.id} withBorder shadow="md" bg="">
                      <Text size="xs">Card ID: {card.id}</Text>
                      {
                        <>
                          <Stack mt="lg" gap={0}>
                            <b>Title</b>
                            <Editor
                              fragment={yListSubdoc.getXmlFragment(
                                `title_${card.id}`
                              )}
                              provider={provider}
                              placeholder="Title here"
                            />
                          </Stack>
                          <Stack gap={0}>
                            <b>Description</b>
                            <Editor
                              fragment={yListSubdoc.getXmlFragment(
                                `description_${card.id}`
                              )}
                              provider={provider}
                              placeholder="Description here"
                            />
                          </Stack>
                        </>
                      }
                      <Button
                        onClick={() => deleteCard(list.id, card.id)}
                        variant="filled"
                        color="red">
                        Remove
                      </Button>
                    </Card>
                  );
                })}

                <Button onClick={() => addCard(list.id)}>Add new card</Button>
              </Stack>
            </Card>
          );
        })}
    </Stack>
  );
}
