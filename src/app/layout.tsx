"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { LiveList, LiveObject } from "@liveblocks/client";
import { RoomProvider } from "@liveblocks/react/suspense";
import { LiveblocksProvider } from "@liveblocks/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const roomID = "my-kanban-test-2024-06-22-3lists";

  // Card
  const initialCard = new LiveObject({
    id: "card-1",
  });

  // List
  const listTodo = new LiveObject({
    id: "list-1",
    cards: new LiveList([initialCard]),
  });
  const listInProgress = new LiveObject({
    id: "list-2",
    cards: new LiveList([]),
  });
  const listDone = new LiveObject({
    id: "list-3",
    cards: new LiveList([]),
  });

  // List
  const initialStorage = {
    lists: new LiveList([listTodo, listInProgress, listDone]),
  };

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}>
        <MantineProvider defaultColorScheme="auto">
          <LiveblocksProvider publicApiKey="pk_dev_-b4yutdv6WGIH81lC_BC9EG-Ux2QPbthDl-kMyVj9pEqPc1vzKHxDG6v5w7WeJVB">
            <RoomProvider
              id={roomID}
              initialPresence={{}}
              initialStorage={initialStorage}
            >
              {children}
            </RoomProvider>
          </LiveblocksProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
