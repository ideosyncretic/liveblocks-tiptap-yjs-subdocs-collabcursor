"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { LiveList, LiveObject } from "@liveblocks/client";
import { RoomProvider } from "../../liveblocks.config";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const roomID = "my-kanban-test-001";

  // Card
  const initialCard = new LiveObject({
    id: "card-1",
  });

  // List
  const initialList = new LiveObject({
    id: "list-1",
    cards: new LiveList([initialCard]),
  });

  // List
  const initialStorage = {
    lists: new LiveList([initialList]),
  };

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}>
        <MantineProvider defaultColorScheme="auto">
          <RoomProvider
            id={roomID}
            initialPresence={{}}
            initialStorage={initialStorage}>
            {children}
          </RoomProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
