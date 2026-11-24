<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashFlow extends Model
{
    protected $fillable = [
        'type', 'source_type', 'source_id',
        'amount', 'description', 'transaction_date', 'balance_after'
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount'           => 'decimal:2',
        'balance_after'    => 'decimal:2',
    ];
}
