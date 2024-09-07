<?php
// +-------------------------------------------------------------
// | 文件: index.php 
// +-------------------------------------------------------------
// | 功能: 提供 miniprogram 的接口
// +-------------------------------------------------------------
// | 时间: 2024-08-11 23:29:16
// +-------------------------------------------------------------
// | 作者: likehong <2528852314@qq.com>
// +-------------------------------------------------------------
namespace app\controller;
use Error;
use Exception;
use think\response\Html;
use think\response\Json;
use think\facade\Log;
use think\facade\Db;
use think\facade\Config;
use app\model\User;
use app\model\Biz;
use app\common\Lib;

class Index
{
    public function __construct() {}

// +--------------------------------------------------------------------
// | 对外的 API 接口区（而具函数放在 app/common/Lib.php）
// +--------------------------------------------------------------------

    /* 首页，显示数据库地址，以及能否连接到它 */ 
    public function index() {
        $msg = '';
        $config = Config::get('database.connections.mysql');
        $msg = $msg . '数据库的地址：'.$config['hostname'].' ';
        try {
            $version = Db::query('SELECT VERSION()');  // 尝试执行一个简单的查询，例如获取当前数据库的版本  
            if ($version) {  $msg = $msg . "数据库连接成功，数据库版本为：" . $version[0]['VERSION()']; } 
            else { $msg = $msg . "查询数据库版本失败，但可能连接仍成功（取决于具体错误）。"; }  
        } catch (\PDOException $e) { $msg = $msg."数据库连接或查询失败：" . $e->getMessage(); }
        return json(['msg' => $msg , 'status' => '1', 'ps' => '添加API：获取用户更多信息', 'rootpath' => dirname(__DIR__)]) ;
    }

    /* 路由测试 hello world */
    public function helloworld() {
        return Lib::hello();
    }

    /* API：获取 openid，其中 $jscode 是小程序生成的临时 code */ 
    public function getWxOpenid() {
        $jscode = input('jscode');
        if($jscode === null) { return json(['msg' => '没有传 jscode 参数']); }
        $url = 'https://api.weixin.qq.com/sns/jscode2session';
        $url = $url . '?appid='.env('WX_APPID');
        $url = $url . '&secret='.env('WX_SECRET');
        $url = $url . '&grant_type=authorization_code';
        $url = $url . '&js_code=' . $jscode;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // 将 curl_exec() 获取的信息以字符串返回，而不是直接输出。  
        curl_setopt($ch, CURLOPT_HEADER, 0); // 不需要返回 HTTP 头部信息
        $response = curl_exec($ch);  
        $data = json_decode($response, true);
        $data['session_key'] = hash_hmac('sha256', '', $data['session_key'], false);  // 将进行了 hmac_sha256 加密后的 session 发送给客户端
        curl_close($ch);
        return json($data);
    }

    /* API：登录验证，如果是新用户，则向数据表里写入登录信息 */
    public function loginCheck() {
        $openid = input('openid'); $token = input('token');
        $checkResultArr = Lib::checkSessionOnline($openid, $token);
        if($checkResultArr['errmsg'] == 'ok') {
            $count = User::where(['user_wxopenid' => $openid])->count();
            if($count == 0) {  // 确定是新用户，写入初始化信息
                $data = [
                    'user_name' => '用户123',
                    'user_wxopenid' => $openid,
                    'token' => hash_hmac('sha256', '', $token, false)  // 将 token 加密处理
                ];
                User::create($data);
                $count_add = User::where(['user_wxopenid' => $openid])->count();
                if($count_add == 1){
                    return json(['msg' => 'ok', 'details' => '成功添加一条用户数据', 'isnew' => 'true']);
                }
            } else {  // 确定是已存在的老用户，则更新一下 session
                $data = ['token' => hash_hmac('sha256', '', $token, false)];
                User::where('user_wxopenid', $openid)->update($data);
                return json(['msg' => 'ok', 'details' => '这是一个老用户']);
            }
        } else {
            return json(['msg' => 'err', 'details' => '原因未知 001']);
        }
    }

    /* （暂时作废）API：获取用户名 */
    public function getUserName() {
        $openid = input('openid');
        $token = input('token');
        $postType = input('postType');
        if($postType === 'storage' && Lib::checkSQLSession($openid, $token)) {
            $username = User::where('user_wxopenid', $openid)->value('user_name');
            return json(['msg' => 'ok', 'details' => '获取用户呢称成功！',
                        'data' => [
                            'username' => $username
                        ]]);
        } else {
            return json(['msg' => 'err', 'details' => '出错了，原因未知']);
        }
    }

    /* API：获取用户更多信息 */
    public function getUserMoreInfo() {
        $openid = input('openid');
        $token = input('token');
        $postType = input('postType');
        if($postType === 'storage' && Lib::checkSQLSession($openid, $token)) {
            $userInfo = User::where('user_wxopenid', $openid)->field('user_name, user_phone, user_avatar')->find();
            return json(['msg' => 'ok', 'details' => '获取用户信息成功！',
                        'data' => [
                            'username' => $userInfo['user_name'],
                            'useravatar' => $userInfo['user_avatar'],
                            'userphone' => $userInfo['user_phone'],
                        ]]);
        } else {
            return json(['msg' => 'err', 'details' => '出错了，原因未知']);
        }
    }

    /* API：修改用户名 */
    public function modUserName() {
        $openid = input('openid');
        $token = input('token');
        $postType = input('postType');
        $newName = input('newName');
        $newName = trim($newName);  // 去除两段的空格
        $newName = mb_substr($newName, 0, 20, 'UTF-8');   // 只截取前 10 个字符
        $newName = Lib::toFullWidth($newName);  // 全角符号化
        $newName = str_replace(array("\r\n", "\n"), '', $newName);  // 删去换行
        if($newName === '') { $newName = 'empty'; }
        $nameCount = User::where(['user_name' => $newName])->count();
        while ($nameCount !== 0) {  // 防止用户名重复
            $newName = $newName.'_'.rand(10, 99);
            $nameCount = User::where(['user_name' => $newName])->count();
        }
        if($postType === 'storage' && Lib::checkSQLSession($openid, $token)) {
            $data = [ 'user_name' => $newName ];
            User::where('user_wxopenid', $openid)->update($data);
            return json(['msg' => 'ok', 'details' => '修改用户呢称成功！'. $newName]);
        } else {
            return json(['msg' => 'err', 'details' => '出错了，原因未知，昵称为' . $newName]);
        }
    }

    /* API：修改头像（这里只接收头像的 url，不接收头像的文件） */
    public function modUserAvatarUrl() {
        $openid = input('openid');
        $token = input('token');
        $postType = input('postType');
        $newAvatarUrl = input('newAvatarUrl');  // 头像的 url 字符串
        $defaultImageUrl = 'cloud://prod-2g3ftnp7705efda4.7072-prod-2g3ftnp7705efda4-1327833301/4d711717560500.jpg';  // 默认头像地址
        if($newAvatarUrl === '') { $newAvatarUrl = $defaultImageUrl; }  // 如果头像地址为空，则使用 默认头像地址
        if($postType === 'storage' && Lib::checkSQLSession($openid, $token)) {  // 鉴权以修改头像 Url
            $data = [ 'user_avatar' => $newAvatarUrl ];
            User::where('user_wxopenid', $openid)->update($data);
            return json(['msg' => 'ok', 'details' => '修改用户头像 url 成功！'. $newAvatarUrl]);
        } else {
            return json(['msg' => 'err', 'details' => '出错了，原因未知，头像 URL 为' . $newAvatarUrl]);
        }
    }


}
