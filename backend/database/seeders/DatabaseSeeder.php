<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- USERS ---
        DB::table('users')->insert([
            [
                'name'       => 'Admin Toko',
                'email'      => 'admin@swalayan.com',
                'password'   => Hash::make('password'),
                'role'       => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Kasir Utama',
                'email'      => 'kasir@swalayan.com',
                'password'   => Hash::make('password'),
                'role'       => 'kasir',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // --- CATEGORIES ---
        $categories = [
            'Sembako', 'Makanan Ringan', 'Minuman', 'Perlengkapan Mandi',
            'Kebersihan Rumah', 'Obat-obatan', 'Alat Tulis'
        ];
        foreach ($categories as $cat) {
            DB::table('categories')->insert([
                'name'       => $cat,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // --- SUPPLIERS ---
        DB::table('suppliers')->insert([
            ['name' => 'CV Jaya Makmur',   'phone' => '081234567890', 'address' => 'Surabaya', 'email' => 'jaya@makmur.com', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'UD Sumber Rejeki', 'phone' => '082345678901', 'address' => 'Sidoarjo',  'email' => 'sumber@rejeki.com', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'PT Maju Bersama',  'phone' => '083456789012', 'address' => 'Gresik',   'email' => 'maju@bersama.com', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // --- PRODUCTS ---
        $products = [
            ['category_id' => 1, 'sku' => 'BRG001', 'name' => 'Beras Premium 5kg',     'buy_price' => 60000,  'sell_price' => 68000,  'stock' => 45, 'min_stock' => 10],
            ['category_id' => 1, 'sku' => 'BRG002', 'name' => 'Minyak Goreng 2L',      'buy_price' => 28000,  'sell_price' => 34000,  'stock' => 30, 'min_stock' => 10],
            ['category_id' => 1, 'sku' => 'BRG003', 'name' => 'Gula Pasir 1kg',        'buy_price' => 14000,  'sell_price' => 17000,  'stock' => 60, 'min_stock' => 15],
            ['category_id' => 1, 'sku' => 'BRG004', 'name' => 'Tepung Terigu 1kg',     'buy_price' => 10000,  'sell_price' => 13000,  'stock' => 8,  'min_stock' => 10],
            ['category_id' => 2, 'sku' => 'MKN001', 'name' => 'Indomie Goreng',        'buy_price' => 2500,   'sell_price' => 3500,   'stock' => 100,'min_stock' => 20],
            ['category_id' => 2, 'sku' => 'MKN002', 'name' => 'Chitato 68gr',          'buy_price' => 7000,   'sell_price' => 10000,  'stock' => 24, 'min_stock' => 12],
            ['category_id' => 3, 'sku' => 'MNM001', 'name' => 'Aqua 600ml',            'buy_price' => 2000,   'sell_price' => 3000,   'stock' => 72, 'min_stock' => 24],
            ['category_id' => 3, 'sku' => 'MNM002', 'name' => 'Teh Botol Sosro 450ml', 'buy_price' => 4000,  'sell_price' => 6000,   'stock' => 3,  'min_stock' => 12],
            ['category_id' => 4, 'sku' => 'PRS001', 'name' => 'Sabun Lifebuoy 90gr',   'buy_price' => 4500,  'sell_price' => 6500,   'stock' => 36, 'min_stock' => 10],
            ['category_id' => 4, 'sku' => 'PRS002', 'name' => 'Shampo Pantene 170ml',  'buy_price' => 15000, 'sell_price' => 20000,  'stock' => 5,  'min_stock' => 8],
        ];
        foreach ($products as $product) {
            DB::table('products')->insert(array_merge($product, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('✅ Seeder berhasil! Data dummy sudah tersimpan di database.');
        $this->command->info('   Email Admin : admin@swalayan.com | Password: password');
        $this->command->info('   Email Kasir : kasir@swalayan.com  | Password: password');
    }
}
