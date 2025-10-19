<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'title',
        'message',
        'user_id',
        'order_id',
        'type',
        'read',
        'global',
        'read_at'
    ];

    protected $casts = [
        'read' => 'boolean',
        'global' => 'boolean',
        'read_at' => 'datetime'
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }


    public function order()
    {
        return $this->belongsTo(Order::class);
    }


    public function markAsRead()
    {
        $this->read = true;
        $this->read_at = now();
        $this->save();
        
        return $this;
    }
}
