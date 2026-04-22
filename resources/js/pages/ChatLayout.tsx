import Echo from "@/lib/echo";
import { Conversation, PageProps, Props, User } from "@/types/chatlayout";
import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import ConversationItem from "@/components/app/conversation-item";


export default function ChatLayout({children} : Props){
const page = usePage<PageProps>();
const conversations = page.props.conversations;
const selectedConversation = page.props.selectedConversation;

const[localConversations, setLocalConversations] = useState<Conversation[]>([]);
const[sortedConversations, setSortedConversations] = useState<Conversation[]>([]);

const[onlineUsers, setOnlineUsers] = useState<Record<number, User>>({});

const isUserOnline = (userId : number) => onlineUsers[userId];

const onSearch = (ev : React.KeyboardEvent<HTMLInputElement>) => {
    const search = ev.currentTarget.value.toLowerCase();
    setLocalConversations(
        conversations.filter((conversation) => {
        return conversation.name?.toLowerCase().includes(search);
        })
    );
};

console.log("conversations",conversations);
console.log("Selected Conversation", selectedConversation);

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
    <div className="flex-1 w-full flex overflow-hidden">
        <div className={`transition-all w-full sm:w-[220px] md:w-[300px] bg-slate-800 flex flex-col overflow-hidden 
            ${ selectedConversation ? "-ml-[100%] sm:ml-0" : ""}`}>
                <div className="flex items-center justify-between py-2 px-3 text-xl font-medium">
                    My Conversations
                    <div className="tooltip tooltip-left" data-tip="Create New Group">
                        <button className="text-gray-400 hover:text-gray-200">
                            <PencilSquareIcon className="w-4 h-4 inline-block ml-2" /> 
                        </button>
                    </div>
                </div>
                <div className="p-3">
                    <Input onKeyUp={onSearch} placeholder="Filter Users and Groups" className="w-full border-ring bg-black/40"/>
                </div>
                <div className="flex-1 overflow-auto">
                    {sortedConversations && 
                       sortedConversations.map((conversation) => (
                            <ConversationItem key={` ${conversation.is_group ? "group_" : "user_"}${conversation.id}`}
                                              conversation= {conversation} online={!!isUserOnline(conversation.id)}
                                              selectedConversation = {selectedConversation}/>
                       ))
                    }
                </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
            {children}
        </div>
    </div>
);

}