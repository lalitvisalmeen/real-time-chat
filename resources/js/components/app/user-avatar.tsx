import { Conversation } from "@/types/chatlayout";

type UserAvatarProps = {
    user : Conversation;
    online : boolean | null;
    profile : boolean | null | undefined;
}

const UserAvatar = ({user, online=null, profile = false} : UserAvatarProps) => {
    let onlineClass = online === true ? "online" : online === false ? "offline" : "";
    const sizeClass = profile ? "w-40" : "w-8";

    return (
        <>
            {user.avatar_url && 
                <div className={`d-chat-image d-avatar d-avatar-${onlineClass}`}>
                    <div className = {`rounded-full ${sizeClass}`}>
                        <img src={user.avatar_url} />
                    </div>
                </div>
            }
            {!user.avatar_url && 
                <div className={`d-chat-image d-avatar d-avatar-placeholder d-avatar-${onlineClass}`}>
                    <div className={`bg-gray-400 text-gray-800 rounded-full ${sizeClass}`}>
                        <span className="text-xl">
                            {user.name.substring(0,1)}
                        </span>
                    </div>
                </div>
            }
        </>
    );

};

export default UserAvatar;