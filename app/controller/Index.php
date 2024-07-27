<?php
// +----------------------------------------------------------------------
// | 文件: index.php
// +----------------------------------------------------------------------
// | 功能: 提供todo api接口
// +----------------------------------------------------------------------
// | 时间: 2021-11-15 16:20
// +----------------------------------------------------------------------
// | 作者: rangangwei<gangweiran@tencent.com>
// +----------------------------------------------------------------------

namespace app\controller;
use Error;
use Exception;
use think\response\Html;
use think\response\Json;
use think\facade\Log;
use think\facade\Db;
use think\facade\Config;
use app\model\User;
use app\common\Lib;

class Index
{
    public function __construct() {
    }

// +----------------------------------------------------------------------
// | 私有函数区
// +----------------------------------------------------------------------

    // /* 私有功能函数：将所有半角符号转化为全角符号，防止 SQL 注入等隐患 */
    // private function toFullWidth($str, $isReversed = false) {  
    //     $from = array(
    //         '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',',
    //         '-', '.', '/', ':', ';', '<', '=', '>', '?', '@',  
    //         '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~',  
    //         ' ',  
    //     );  
    //     $to = array( 
    //         '！', '＂', '＃', '＄', '％', '＆', '＇', '（', '）', '＊', '＋', '，',
    //         '－', '．', '／', '：', '；', '＜', '＝', '＞', '？', '＠',  
    //         '［', '＼', '］', '＾', '＿', '｀', '｛', '｜', '｝', '～',  
    //         '　',  
    //     );  
    //     if($isReversed){ return str_replace($from, $str, $to); 
    //     } else { return str_replace($from, $to, $str); }
    // }

    // /* 私有函数，用于检测用户的 openid 和 token 是否和数据库中相符 */
    // private function checkSQLSession($openid ='none', $token = 'no_token') {
    //     $token = hash_hmac('sha256', '', $token, false);  // 再加一次秘
    //     $sqlGetUserToken = User::where('user_wxopenid', $openid)->value('token');
    //     return hash_equals($token, $sqlGetUserToken);
    // }

    // /* 私有函数，获取 wx token */
    // private function getToken() {
    //     $url = 'https://api.weixin.qq.com/cgi-bin/token?';
    //     $url = $url . 'grant_type=client_credential';
    //     $url = $url . '&appid='.env('WX_APPID');
    //     $url = $url . '&secret='.env('WX_SECRET');
    //     $ch = curl_init();
    //     curl_setopt($ch, CURLOPT_URL, $url);
    //     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // 将 curl_exec() 获取的信息以字符串返回，而不是直接输出。  
    //     curl_setopt($ch, CURLOPT_HEADER, 0); // 不需要返回 HTTP 头部信息
    //     $response = curl_exec($ch);  
    //     $data = json_decode($response, true);
    //     curl_close($ch); 
    //     return $data;
    // }

    // /* 私有函数：向微信官方服务器检验当前客户端提供的 id 和 session 是否正确 */
    // private function checkSessionOnline($openid, $sha_session) {
    //     $token = '';
    //     $tokenDataArr = Lib::getToken();
    //     if (isset($tokenDataArr['access_token'])) {  
    //         $token = $tokenDataArr['access_token'];
    //     } else { json(['msg' => 'ERROR']); }
    //     $url = 'https://api.weixin.qq.com/wxa/checksession?';
    //     $url = $url . 'access_token='.$token;
    //     $url = $url . '&signature='.$sha_session;  // 没人知道原版是什么，session 已经是加密的了
    //     $url = $url . '&openid='.$openid;
    //     $url = $url . '&sig_method=hmac_sha256';
    //     $ch = curl_init();
    //     curl_setopt($ch, CURLOPT_URL, $url);
    //     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // 将 curl_exec() 获取的信息以字符串返回，而不是直接输出。  
    //     curl_setopt($ch, CURLOPT_HEADER, 0); // 不需要返回 HTTP 头部信息
    //     $response = curl_exec($ch);  
    //     $data = json_decode($response, true);
    //     curl_close($ch);
    //     return $data;
    // }

// +----------------------------------------------------------------------
// | 对外的 API 开放区
// +----------------------------------------------------------------------

    /* 首页，显示数据库地址以及能否连接到它 */ 
    public function index() {
        $msg = '';
        $config = Config::get('database.connections.mysql');
        $msg = $msg . '数据库的地址：'.$config['hostname'].' ';
        try {
            $version = Db::query('SELECT VERSION()');  // 尝试执行一个简单的查询，例如获取当前数据库的版本  
            if ($version) {  $msg = $msg . "数据库连接成功，数据库版本为：" . $version[0]['VERSION()']; } 
            else { $msg = $msg . "查询数据库版本失败，但可能连接仍成功（取决于具体错误）。"; }  
        } catch (\PDOException $e) { $msg = $msg."数据库连接或查询失败：" . $e->getMessage(); }
        return json(['msg' => $msg , 'status' => '1', 'ps' => '改成了create', 'rootpath' => dirname(__DIR__)]) ;
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
        $url = $url . '?appid='.env('WX_APPID');  // 敏感数据
        $url = $url . '&secret='.env('WX_SECRET');  // 敏感数据
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
            } else {  // 老用户
                return json(['msg' => 'ok', 'details' => '这是一个老用户']);
            }
        } else {
            return json(['msg' => 'err', 'details' => '原因未知 001']);
        }
    }

    /* API：获取用户名 */
    public function getUserName() {
        $openid = input('openid');
        $token = input('token');
        $postType = input('postType');
        if($postType === 'storage' && Lib::checkSQLSession($openid, $token)) {
            $username = User::where('user_wxopenid', $openid)->value('user_name');
            return json(['msg' => 'ok', 'details' => '获取用户呢称成功！', 'data' => ['username' => $username]]);
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
        $newName = substr($newName, 0, 10);  // 只截取前 10 个字符
        $newName = Lib::toFullWidth($newName);  // 全角符号化
        if($newName === '') { $newName = 'empty'; }
        $nameCount = User::where(['user_name' => $newName])->count();
        while ($nameCount !== 0) {  // 防止用户名重复
            $newName = $newName.'_'.($nameCount);
            $nameCount = User::where(['user_name' => $newName])->count();
        }
        if($postType === 'storage' && Lib::checkSQLSession($openid, $token)) {
            $data = [ 'user_name' => $newName ];
            User::where('user_wxopenid', $openid)->update($data);
            return json(['msg' => 'ok', 'details' => '修改用户呢称成功！']);
        } else {
            return json(['msg' => 'err', 'details' => '出错了，原因未知']);
        }
    }
}
