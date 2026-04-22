import { StringToBoolean } from "class-variance-authority/types";
import test from "node:test";
import { ReactNode } from "react";

export type Props = {
    children: ReactNode;
}

export type PageProps = {
     conversations: Conversation[];
     selectedConversation : Conversation;
     auth : {
        user : User;
     }
}

export type Conversation = {
    id: number;
    name: string;
    blocked_at: string;
    last_message_date: string;
    is_group: boolean;
    is_user : boolean;
    last_message : string;
    avatar_url : string | null;
    is_admin : boolean;

}
export type User = {
    id: number;
    name: string;
    is_admin : boolean;
}

export type Error = {
    type: string;
    error: string;
    status: number;
}