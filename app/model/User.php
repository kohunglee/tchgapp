<?php
namespace app\model;
use Error;
use Exception;
use think\response\Html;
use think\response\Json;
use think\facade\Log;
use think\facade\Db;
use think\facade\Config;
use think\Model;

class User extends Model  // 用户信息 数据表 user 模型初始化
{
    protected static function init() {

    }
}