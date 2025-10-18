<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Buscar notificações do usuário e notificações globais
        $notifications = Notification::where(function($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('global', true);
        })
        ->orderBy('created_at', 'desc')
        ->get();
        
        return response()->json($notifications);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'order_id' => 'nullable|exists:orders,id',
            'type' => 'required|in:info,success,warning,error',
            'global' => 'boolean'
        ]);
        
        $notification = new Notification();
        $notification->title = $request->title;
        $notification->message = $request->message;
        $notification->user_id = $request->user_id ?? null;
        $notification->order_id = $request->order_id ?? null;
        $notification->type = $request->type;
        $notification->global = $request->global ?? false;
        $notification->read = false;
        $notification->save();
        
        return response()->json($notification, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $notification = Notification::findOrFail($id);
        return response()->json($notification);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(string $id)
    {
        $notification = Notification::findOrFail($id);
        $notification->markAsRead();
        
        return response()->json($notification);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        
        Notification::where(function($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('global', true);
        })
        ->where('read', false)
        ->update(['read' => true, 'read_at' => now()]);
        
        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Create order status notification
     */
    public function createOrderStatusNotification(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'status' => 'required|string'
        ]);
        
        $order = Order::findOrFail($request->order_id);
        
        $notification = new Notification();
        $notification->title = 'Status do Pedido Atualizado';
        $notification->message = "O pedido #{$order->id} foi atualizado para {$request->status}";
        $notification->user_id = $order->user_id;
        $notification->order_id = $order->id;
        $notification->type = 'info';
        $notification->global = true; // Notificação visível para todos
        $notification->read = false;
        $notification->save();
        
        return response()->json($notification, 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();
        
        return response()->json(null, 204);
    }
}
