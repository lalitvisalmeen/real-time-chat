<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use App\Models\Message;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [HomeController::class, 'home'])->name('home');
    Route::get("/user/{user}", [MessageController::class,'byUser'])->name('chat.user');
    Route::get('/group/{group}',[MessageController::class, 'byGroup'])->name('chat.group');

    Route::post('/message',[MessageController::class, 'store'])->name('message.store');
    Route::delete('/message/{message}',[MessageController::class, 'destroy'])->name('message.destroy');

    Route::get('/message/older/{message}', [MessageController::class, 'loadOlder'])->name('message.loadOlder');

});


require __DIR__.'/settings.php';
