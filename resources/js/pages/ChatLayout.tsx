import Echo from "@/lib/echo";
import { Conversation, PageProps, Props, User } from "@/types/chatlayout";
import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";


export default function ChatLayout({children} : Props){
const page = usePage<PageProps>();
const conversations = page.props.conversations;
const selectedConversations = page.props.conversations;

const[localConversations, setLocalConversations] = useState<Conversation[]>([]);
const[sortedConversations, setSortedConversations] = useState<Conversation[]>([]);

const[onlineUsers, setOnlineUsers] = useState<Record<number, User>>({});

const isUserOnline = (userId : number) => onlineUsers[userId];

console.log("conversations",conversations);
console.log("Selected Conversations", selectedConversations);

useEffect(() => {
    setSortedConversations(
        localConversations.sort((a, b) => {
            if(a.blocked_at && b.blocked_at){
                return a.blocked_at > b.blocked_at ? 1 : -1;
            }else if(a.blocked_at){
                return 1;
            }else if (b.blocked_at){
                return -1;
            }

            if(a.last_message_date && b.last_message_date){
                return b.last_message_date.localeCompare(a.last_message_date);
            }else if(a.last_message_date){
                return -1;
            }else if(b.last_message_date){
                return 1;
            }else{
                return 0;
            }
        })
    );
}, [localConversations]);

useEffect(() => {setLocalConversations(conversations)}, [conversations]);


useEffect(() => {
    Echo.join("online")
            .here((users : User[]) => {
                const onlineUserObj = Object.fromEntries(
                    users.map((user) => [user.id, user])
                );

                setOnlineUsers((prevOnlineUsers : Record<number, User>) => {
                    return {...prevOnlineUsers, ...onlineUserObj};
                });
            })
            .joining((user : User) => {
                setOnlineUsers((prevOnlineUsers : Record<number, User>) => {
                        const updatedUsers = {...prevOnlineUsers};
                        updatedUsers[user.id] = user;
                        return updatedUsers;
                });
            })
            .leaving((user : User) => {
                setOnlineUsers((prevOnlineUsers : Record<number, User>) => {
                    const updatedUsers = {...prevOnlineUsers};
                    delete updatedUsers[user.id];
                    return updatedUsers;
                });
            })
            .error((error : Error) => {
                console.log("Error", error);
            })
}, []);
return (
    <div>
        ChatLayout
        <div>
         {children}
        </div>
    </div>
);

}