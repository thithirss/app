<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'destination',
        'status',
        'order_id',
        'requester_name',
        'departure_date',
        'return_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}