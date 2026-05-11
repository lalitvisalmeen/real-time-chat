<?php

namespace App\Http\Controllers;

use App\Events\SocketMessage;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    public function byUser(User $user){

        $messages = Message::where(function($query) use ($user){
                                $query->where('sender_id', Auth::id())
                                        ->where('receiver_id', $user->id);
                            })->orWhere(function($query) use($user) {
                                $query->where('sender_id', $user->id)
                                        ->where('receiver_id', Auth::id());
                            })->latest()->paginate(10);
       

        return inertia('home',['selectedConversation' => $user->toConversationArray(),
                        'messages' => MessageResource::collection($messages)]);
    }

    public function byGroup(Group $group){
        $messages = Message::where('group_id', $group->id)
                        ->latest()
                        ->paginate(10);

        return inertia('home', ['selectedConversation' => $group->toConversationArray(),
                            'messages' => MessageResource::collection($messages)]);

    }

    public function loadOlder(Message $message){

            if($message->group_id){
                $messages = Message::where('created_at' ,'<', $message->created_at)
                                    ->where('group_id',$message->group_id)
                                    ->latest()
                                    ->paginate(10);

            }else{
                $messages = Message::where('created_at', '<', $message->created_at)
                                    ->where(function ($query) use ($message){
                                            $query->where('sender_id', $message->sender_id)
                                                  ->where('receiver_id', $message->receiver_id);
                                    })->orWhere(function($query) use($message) {
                                        $query->Where('sender_id', $message->receiver_id)
                                                  ->where('receiver_id', $message->sender_id);
                                    })->latest()->paginate(10);
            }

            return MessageResource::collection($messages);

    }

    public function store(StoreMessageRequest $request){
        $data = $request->validated();
        $data['sender_id'] = Auth::id();
        $receiverId = $data['receiver_id'] ?? null;
        $groupId = $data['group_id'] ?? null;

        $files = $data['attachments'] ?? [];

        $message = Message::create($data);

        $attachments = [];

        // Iterate to the attachments received in the conversation and add it to MessageAttachment table and also store the attachment in the local storage
        if($files){
            foreach($files as $file){
                $directory = 'attachments/'. Str::random(32);
                Storage::makeDirectory($directory);

                $attachmentData = [
                    'message_id' => $message->id,
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                    'path' => $file->store($directory, 'public'),
                ];

                $$attachments[] = MessageAttachment::create($attachmentData);
            }
            $message->attachments = $attachments;
        }

        // if the receiver exists, then this conversation is considered as one to one and to be added or updated in the conversation table
        if($receiverId){
            Conversation::updateConversationWithMessage($receiverId, Auth::id(), $message);
        }

        // if the group id exists, then this conversation belongs to the group and we need to update the last_message_id in the group

        if($groupId){
            Group::updateGroupWithMessage($groupId, $message->id);
        }

        // Inform the browser via reverb that a message has been received
        SocketMessage::dispatch($message);

        return new MessageResource($message);
    }

    public function destroy(Message $message){

        // check if the user is the sender of the message. if the user is not the sender, then he cannot delete the message\

        if($message->sender_id !== Auth::id()){
            return response()->json(['message' => 'Forbidden to delete the message'], 403);
        }

        $message->delete();

        return response('Deleted the message', 204);
    }
}
