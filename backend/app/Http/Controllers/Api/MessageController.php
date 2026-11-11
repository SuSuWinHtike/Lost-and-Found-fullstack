<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Notification;
use App\Models\PetReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function conversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $conversations = Conversation::with([
            'petReport.images',
            'userOne',
            'userTwo',
            'messages' => function ($q) {
                $q->latest()->limit(1);
            },
        ])
            ->where(function ($q) use ($userId) {
                $q->where('user_one_id', $userId)
                    ->orWhere('user_two_id', $userId);
            })
            ->orderBy('last_message_at', 'desc')
            ->get();

        // Format for frontend
        $data = $conversations->map(function ($c) use ($userId) {
            $otherUser = ($c->user_one_id === $userId) ? $c->userTwo : $c->userOne;
            $unreadCount = Message::where('conversation_id', $c->id)
                ->where('recipient_id', $userId)
                ->where('is_read', false)
                ->count();

            return [
                'id' => $c->id,
                'other_user' => $otherUser,
                'pet_report' => $c->petReport,
                'last_message' => $c->messages->first(),
                'unread_count' => $unreadCount,
                'last_message_at' => $c->last_message_at,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function messages(Request $request, int $conversationId): JsonResponse
    {
        $userId = $request->user()->id;

        $conversation = Conversation::with(['petReport.images', 'userOne', 'userTwo'])
            ->where('id', $conversationId)
            ->where(function ($q) use ($userId) {
                $q->where('user_one_id', $userId)
                    ->orWhere('user_two_id', $userId);
            })
            ->first();

        if (! $conversation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found or access denied.',
            ], 403);
        }

        // Mark unread messages as read
        Message::where('conversation_id', $conversationId)
            ->where('recipient_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $messages = Message::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'conversation' => $conversation,
            'data' => $messages,
        ]);
    }

    public function sendMessage(Request $request, int $conversationId): JsonResponse
    {
        $userId = $request->user()->id;

        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($q) use ($userId) {
                $q->where('user_one_id', $userId)
                    ->orWhere('user_two_id', $userId);
            })
            ->first();

        if (! $conversation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found.',
            ], 403);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $recipientId = ($conversation->user_one_id === $userId)
            ? $conversation->user_two_id
            : $conversation->user_one_id;

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $userId,
            'recipient_id' => $recipientId,
            'message_text' => trim($validated['message']),
            'is_read' => false,
        ]);

        $conversation->update(['last_message_at' => now()]);

        // Send notification to recipient
        Notification::create([
            'user_id' => $recipientId,
            'type' => 'message',
            'title' => "New message from {$request->user()->name}",
            'message' => substr($message->message_text, 0, 80),
            'action_url' => '/user/messages',
            'data' => ['conversation_id' => $conversation->id, 'sender_id' => $userId],
            'is_read' => false,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $message,
        ], 201);
    }

    public function startConversation(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $validated = $request->validate([
            'recipient_id' => ['required', 'exists:users,id', 'different:' . $userId],
            'pet_report_id' => ['nullable', 'exists:pet_reports,id'],
            'initial_message' => ['nullable', 'string', 'max:1000'],
        ]);

        $recipientId = $validated['recipient_id'];
        $petId = $validated['pet_report_id'] ?? null;

        // Find existing conversation between these two users
        $conversation = Conversation::where(function ($q) use ($userId, $recipientId) {
            $q->where('user_one_id', $userId)->where('user_two_id', $recipientId);
        })->orWhere(function ($q) use ($userId, $recipientId) {
            $q->where('user_one_id', $recipientId)->where('user_two_id', $userId);
        })->first();

        if (! $conversation) {
            $conversation = Conversation::create([
                'pet_report_id' => $petId,
                'user_one_id' => $userId,
                'user_two_id' => $recipientId,
                'last_message_at' => now(),
            ]);
        } elseif ($petId && ! $conversation->pet_report_id) {
            $conversation->update(['pet_report_id' => $petId]);
        }

        if (! empty($validated['initial_message'])) {
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $userId,
                'recipient_id' => $recipientId,
                'message_text' => trim($validated['initial_message']),
                'is_read' => false,
            ]);
            $conversation->update(['last_message_at' => now()]);
        }

        return response()->json([
            'status' => 'success',
            'conversation_id' => $conversation->id,
            'data' => $conversation->load(['petReport.images', 'userOne', 'userTwo']),
        ]);
    }
}
