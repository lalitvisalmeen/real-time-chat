<?php

use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [HomeController::class, 'home'])->name('home');
    Route::get('/user/{user}', function() {

    })->name('chat.user');
    Route::get('/grouo/{group}', function() {

    })->name('chat.group');

});


require __DIR__.'/settings.php';
