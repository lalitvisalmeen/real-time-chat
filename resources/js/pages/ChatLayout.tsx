import { usePage } from "@inertiajs/react";

export default function ChatLayout({children}){
const page = usePage();
const conversations = page.props.conversations;
const selectedConversations = page.props.conversations;

console.log(conversations);
console.log(selectedConversations);

return (
    <div></div>
);

}