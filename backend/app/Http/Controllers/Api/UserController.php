<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('id')
            ->get();

        return response()->json($users);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role'     => 'required|in:admin,kasir',
        ], [
            'name.required'     => 'Nama lengkap wajib diisi.',
            'email.required'    => 'Alamat email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'email.unique'      => 'Alamat email ini sudah terdaftar digunakan akun lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal 6 karakter.',
            'role.required'     => 'Peran / role pengguna wajib dipilih.',
            'role.in'           => 'Peran harus berupa admin atau kasir.',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'],
        ]);

        return response()->json($user, 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        return response()->json($user->only(['id', 'name', 'email', 'role', 'created_at']));
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|min:6',
            'role'     => 'required|in:admin,kasir',
        ], [
            'name.required'     => 'Nama lengkap wajib diisi.',
            'email.required'    => 'Alamat email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'email.unique'      => 'Alamat email ini sudah digunakan oleh akun lain.',
            'password.min'      => 'Password baru minimal terdiri dari 6 karakter.',
            'role.required'     => 'Peran / role pengguna wajib dipilih.',
            'role.in'           => 'Peran harus berupa admin atau kasir.',
        ]);

        // Jaga agar minimal tetap ada 1 akun admin di sistem jika role diubah dari admin ke kasir
        if ($user->role === 'admin' && $validated['role'] !== 'admin') {
            $otherAdminCount = User::where('role', 'admin')
                ->where('id', '!=', $user->id)
                ->count();

            if ($otherAdminCount === 0) {
                return response()->json([
                    'message' => 'Tidak dapat mengubah role akun admin ini. Sistem harus memiliki minimal 1 akun dengan role Admin.',
                ], 422);
            }
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json($user);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user, Request $request)
    {
        // Cegah menghapus akun sendiri yang sedang aktif login
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.',
            ], 422);
        }

        // Jaga agar minimal tetap ada 1 akun admin di sistem
        if ($user->role === 'admin') {
            $otherAdminCount = User::where('role', 'admin')
                ->where('id', '!=', $user->id)
                ->count();

            if ($otherAdminCount === 0) {
                return response()->json([
                    'message' => 'Tidak dapat menghapus admin terakhir. Sistem harus memiliki minimal 1 akun Administrator.',
                ], 422);
            }
        }

        $user->delete();

        return response()->json([
            'message' => 'Pengguna berhasil dihapus.',
        ]);
    }
}
