import { ReactNode } from "react";

export type Props = {
    children: ReactNode;
}

export type PageProps = {
     conversations: Conversation[];
}

export type Conversation = {
    id: number;
    name: string;
    blocked_at: string;
    last_message_date: string;

}
export type User = {
    id: number;
    name: string;
}

export type Error = {
    type: string;
    error: string;
    status: number;
}