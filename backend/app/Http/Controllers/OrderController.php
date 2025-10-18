<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * List orders with optional status filter. All users can see all orders.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $status = $request->query('status');

        $query = Order::query();
        if ($status) {
            $query->where('status', $status);
        }

        // Removida a restrição para que todos os usuários vejam todos os pedidos
        // Mantém a ordenação por data de criação (mais recentes primeiro)
        $orders = $query->orderByDesc('created_at')->get();

        return response()->json($orders);
    }

    /**
     * Create a new order assigned to the authenticated user.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Support both form-urlencoded and JSON bodies reliably
        $payload = $request->all();
        if (empty($payload)) {
            $payload = $request->json()->all();
        }

        $validator = \Validator::make($payload, [
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

    /**
     * Show a specific order by ID.
     */
    public function show(Request $request, int $id)
    {
        $user = $request->user();
        $order = Order::findOrFail($id);

        // Todos os usuários podem ver todos os pedidos
        return response()->json($order);
    }

    /**
     * Update the status of an order. Admins can update any; users can update their own.
     */
    public function updateStatus(Request $request, int $id)
    {
        $user = $request->user();
        $payload = $request->all();
        if (empty($payload)) {
            $payload = $request->json()->all();
        }
        $validator = \Validator::make($payload, [
            'status' => ['required','string','in:pending,approved,cancelled,in_progress'],
        ]);
        $validator->validate();
        $data = $validator->validated();

        $order = Order::findOrFail($id);

        if (!(bool) $user->is_admin && $order->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $order->status = $data['status'];
        $order->save();

        return response()->json(['message' => 'Status atualizado', 'order' => $order]);
    }
}