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

class Index
{
    public function __construct() {
        $this->temp_session = '';
    }

    /* 首页，显示数据库地址以及能否连接到它 */ 
    public function index() {
        $msg = '';
        $config = Config::get('database.connections.mysql');
        $msg = $msg . '数据库的地址：'.$config['hostname'].' ';
        try {
            $version = Db::query('SELECT VERSION()');  // 尝试执行一个简单的查询，例如获取当前数据库的版本  
            if ($version) {  $msg = $msg . "数据库连接成功，数据库版本为：" . $version[0]['VERSION()']; } 
            else { $msg = $msg . "查询数据库版本失败，但可能连接仍成功（取决于具体错误）。"; }  
        } catch (\PDOException $e) { $msg += "数据库连接或查询失败：" . $e->getMessage(); }
        return json(['msg' => $msg , 'status' => '1', 'ps' => '加了一个 user']);
    }

    /* 路由测试 hello world */
    public function helloworld() {
        return 'Hello world!';
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

    /* 私有函数，获取 wx token */
    private function getToken() {
        $url = 'https://api.weixin.qq.com/cgi-bin/token?';
        $url = $url . 'grant_type=client_credential';
        $url = $url . '&appid='.env('WX_APPID');
        $url = $url . '&secret='.env('WX_SECRET');
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // 将 curl_exec() 获取的信息以字符串返回，而不是直接输出。  
        curl_setopt($ch, CURLOPT_HEADER, 0); // 不需要返回 HTTP 头部信息
        $response = curl_exec($ch);  
        $data = json_decode($response, true);
        curl_close($ch); 
        return $data;
    }

    /* API：向微信官方服务器检验当前客户端提供的 id 和 session 是否正确 */
    public function checkSession($returnThinkJSON = true) {
        $openid = input('openid'); $sha_session = input('sha_session');
        $token = '';
        $tokenDataArr = $this->getToken();
        if (isset($tokenDataArr['access_token'])) {  
            $token = $tokenDataArr['access_token'];
        } else { json(['msg' => 'ERROR']); }
        $url = 'https://api.weixin.qq.com/wxa/checksession?';
        $url = $url . 'access_token='.$token;
        $url = $url . '&signature='.$sha_session;
        $url = $url . '&openid='.$openid;
        $url = $url . '&sig_method=hmac_sha256';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // 将 curl_exec() 获取的信息以字符串返回，而不是直接输出。  
        curl_setopt($ch, CURLOPT_HEADER, 0); // 不需要返回 HTTP 头部信息
        $response = curl_exec($ch);  
        $data = json_decode($response, true);
        curl_close($ch);
        return ($returnThinkJSON) ? json($data) : $data;
    }

    /* 私有函数：向微信官方服务器检验当前客户端提供的 id 和 session 是否正确 */
    private function checkSession_private($openid, $sha_session) {
        $token = '';
        $tokenDataArr = $this->getToken();
        if (isset($tokenDataArr['access_token'])) {  
            $token = $tokenDataArr['access_token'];
        } else { json(['msg' => 'ERROR']); }
        $url = 'https://api.weixin.qq.com/wxa/checksession?';
        $url = $url . 'access_token='.$token;
        $url = $url . '&signature='.$sha_session;
        $url = $url . '&openid='.$openid;
        $url = $url . '&sig_method=hmac_sha256';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // 将 curl_exec() 获取的信息以字符串返回，而不是直接输出。  
        curl_setopt($ch, CURLOPT_HEADER, 0); // 不需要返回 HTTP 头部信息
        $response = curl_exec($ch);  
        $data = json_decode($response, true);
        curl_close($ch);
        return $data;
    }

    /* API：尝试向数据表里写入登录信息 */
    public function loginCheck() {

        $isStorage = true;
        $openid = env('TEMP_OPENID');
        $token = env('TEMP_TOKEN');

        
        if($isStoragesNew) {
            $count = Db::name('user')->where(['user_wxopenid' => $openid])->count();
            
            if($count == 0) {  // 确定是新用户，写入初始化信息
                $checkResultArr = $this->checkSession_private($openid, $token);  
                if(isset($checkResultArr['errmsg']) && $checkResultArr['errmsg'] == 'ok'){  // 官网核验通过，向数据库添加新数据（新用户，在短时间内验证两次，不过分吧？）
                    $data = [
                        'user_name' => '昵称默认值',
                        'user_wxopenid' => $openid,
                        'token' => hash_hmac('sha256', '', $token, false)  // 将 token 加密处理
                    ];
                    Db::name('user')->save($data);
                    return json(['msg' => 'ok', 'details' => '成功添加一条用户数据', 'isnew' => 'true']);
                } else { return json(['msg' => 'err', 'details' => '出错了, 官网核验未通过']); }
                
            } else {  // 老用户
                return json(['msg' => 'err', 'details' => '已经存在这个用户']);
            }
        } else {}
    }
}
