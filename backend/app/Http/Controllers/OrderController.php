<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{

    public function index(Request $request)
    {
        $user = $request->user();
        $status = $request->query('status');

        $query = Order::query();
        
        
        if (!(bool) $user->is_admin) {
            $query->where('user_id', $user->id);
        }
        
        if ($status) {
            $query->where('status', $status);
        }

        
        $orders = $query->orderByDesc('created_at')->get();

        return response()->json($orders);
    }


    public function store(Request $request)
    {
        $user = $request->user();

        
        $payload = $request->all();
        if (empty($payload)) {
            $payload = $request->json()->all();
        }

        $validator = Validator::make($payload, [
            'requesterName' => ['required', 'string', 'max:255'],
            'destination' => ['required', 'string', 'max:255'],
            'departureDate' => ['required', 'date'],
            'returnDate' => ['required', 'date'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:solicitado,aprovado,cancelado,em_andamento,pending,approved,cancelled,in_progress'],
        ]);
        $validator->validate();
        $data = $validator->validated();

        $order = Order::create([
            'user_id' => $user->id,
            'title' => $data['requesterName'] . ' - ' . $data['destination'],
            'requester_name' => $data['requesterName'],
            'destination' => $data['destination'],
            'departure_date' => $data['departureDate'],
            'return_date' => $data['returnDate'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? 'solicitado',
        ]);

        return response()->json($order, 201);
    }

    public function show(Request $request, int $id)
    {
        $user = $request->user();
        $order = Order::findOrFail($id);

        
        return response()->json($order);
    }

    public function updateStatus(Request $request, int $id)
    {
        $user = $request->user();
        
        
        if (!(bool) $user->is_admin) {
            return response()->json(['message' => 'Apenas administradores podem alterar o status'], 403);
        }
        
        $payload = $request->all();
        if (empty($payload)) {
            $payload = $request->json()->all();
        }
        $validator = Validator::make($payload, [
            'status' => ['required','string','in:pending,approved,cancelled,in_progress'],
        ]);
        $validator->validate();
        $data = $validator->validated();

        $order = Order::findOrFail($id);

        
        if ($data['status'] === 'cancelled' && $order->status === 'approved') {
            return response()->json(['message' => 'Não é possível cancelar um pedido que já foi aprovado'], 422);
        }

        $order->status = $data['status'];
        $order->save();

        return response()->json(['message' => 'Status atualizado', 'order' => $order]);
    }

 
    public function update(Request $request, int $id)
    {
        $user = $request->user();
        $order = Order::findOrFail($id);

        
        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Apenas pedidos com status pendente podem ser editados'], 403);
        }

        
        $payload = $request->all();
        if (empty($payload)) {
            $payload = $request->json()->all();
        }

        $validator = Validator::make($payload, [
            'requester_name' => ['required', 'string', 'max:255'],
            'destination' => ['required', 'string', 'max:255'],
            'departure_date' => ['required', 'date'],
            'return_date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
        ]);
        $validator->validate();
        $data = $validator->validated();

        $order->update([
            'requester_name' => $data['requester_name'],
            'destination' => $data['destination'],
            'departure_date' => $data['departure_date'],
            'return_date' => $data['return_date'],
            'description' => $data['description'] ?? $order->description,
        ]);

        return response()->json(['message' => 'Pedido atualizado com sucesso', 'order' => $order]);
    }
}