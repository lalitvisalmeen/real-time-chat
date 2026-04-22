<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'avatar',
        'email_verified_at',
        'name',
        'email',
        'password',
        'is_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function groups(){
        return $this->belongsToMany(Group::class, 'group_users');
    }

    public static function getUsersExceptUser(User $user){

        $userId = $user->id;
        $query = User::select(['users.*', 'messages.message as last_message', 'messages.created_at as last_message_date', 'messages.id as last_message_id'])
            ->distinct()
            ->where('users.id', '!=', $userId)
            ->when(!$user->is_admin, function ($query) {
                $query->whereNull('users.blocked_at');
            })
            ->leftJoin(DB::raw('(
                SELECT 
                    other_user_id,
                    MAX(last_message_id) as max_last_message_id
                FROM (
                    SELECT 
                        CASE 
                            WHEN user_id1 = ' . $userId . ' THEN user_id2 
                            ELSE user_id1 
                        END as other_user_id,
                        last_message_id
                    FROM conversations
                    WHERE user_id1 = ' . $userId . ' OR user_id2 = ' . $userId . '
                ) as temp
                GROUP BY other_user_id
            ) as conv_summary'), function ($join) {
                            $join->on('conv_summary.other_user_id', '=', 'users.id');
            })->leftJoin('messages', 'messages.id', '=', 'conv_summary.max_last_message_id')
                
              ->orderBy('messages.created_at', 'desc')
              ->orderBy('users.name');
              //  dd($query->toSql());

            return $query->get();

    }

    public function toConversationArray(){
        return [
            'id' => $this->id,
            'name' => $this->name,
            'is_group' => false,
            'is_user' => true,
            'is_admin' => (bool)$this->is_admin,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'blocked_at' => $this->blocked_at,
            'last_message_id' => $this->last_message_id,
            'last_message' => $this->last_message,
            'last_message_date' => $this->last_message_date,
        ];
    }
}
