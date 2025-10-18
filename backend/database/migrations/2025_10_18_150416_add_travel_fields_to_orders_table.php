<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_id')->nullable()->after('id');
            $table->string('requester_name')->nullable()->after('title');
            $table->date('departure_date')->nullable()->after('destination');
            $table->date('return_date')->nullable()->after('departure_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['order_id', 'requester_name', 'departure_date', 'return_date']);
        });
    }
};
