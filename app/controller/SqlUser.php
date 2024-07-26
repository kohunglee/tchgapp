<?php

namespace app\controller;
use Error;
use Exception;
use think\response\Html;
use think\response\Json;
use think\facade\Log;
use think\facade\Db;
use think\facade\Config;

use app\model\User;

class SqlUser 
{
    public function index() {
        return 'this is user!';
    }
}
