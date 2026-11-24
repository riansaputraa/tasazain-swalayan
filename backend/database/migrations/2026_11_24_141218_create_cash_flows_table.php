<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_flows', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['income', 'expense']); // pemasukan atau pengeluaran
            $table->string('source_type'); // sale, purchase, expense (polymorphic label)
            $table->unsignedBigInteger('source_id');
            $table->decimal('amount', 15, 2);
            $table->string('description');
            $table->date('transaction_date');
            $table->decimal('balance_after', 15, 2)->nullable(); // saldo akumulatif
            $table->timestamps();

            $table->index(['source_type', 'source_id']);
            $table->index('transaction_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_flows');
    }
};
