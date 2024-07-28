<?php
namespace app\common;
use Error;
use Exception;
use think\response\Html;
use think\response\Json;
use think\facade\Log;
use think\facade\Db;
use think\facade\Config;
use app\model\User;

/* 一些工具函数 */

class Lib
{
    protected static function init() {  // 模型初始化
        
    }

    public static function hello(){
        return 'model hello';
    }

    /* 私有功能函数：将所有半角符号转化为全角符号，防止 SQL 注入等隐患 */
    public static function toFullWidth($str, $isReversed = false) {  
        $from = array(
            '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',',
            '-', '.', '/', ':', ';', '<', '=', '>', '?', '@',  
            '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~',  
            ' ',  
        );  
        $to = array( 
            '！', '＂', '＃', '＄', '％', '＆', '＇', '（', '）', '＊', '＋', '，',
            '－', '．', '／', '：', '；', '＜', '＝', '＞', '？', '＠',  
            '［', '＼', '］', '＾', '＿', '｀', '｛', '｜', '｝', '～',  
            '　',  
        );  
        if($isReversed){ return str_replace($from, $str, $to); 
        } else { return str_replace($from, $to, $str); }
    }

    /* 用于检测用户的 openid 和 token 是否和数据库中相符 */
    public static function checkSQLSession($openid ='none', $token = 'no_token') {
        $token = hash_hmac('sha256', '', $token, false);  // 再加一次秘
        $sqlGetUserToken = User::where('user_wxopenid', $openid)->value('token');
        return hash_equals($token, $sqlGetUserToken);
    }

    /* 获取 wx token */
    public static function getToken() {
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

    /* 向微信官方服务器检验当前客户端提供的 id 和 session 是否正确 */
    public static function checkSessionOnline($openid, $sha_session) {
        $token = '';
        $tokenDataArr = Lib::getToken();
        if (isset($tokenDataArr['access_token'])) {  
            $token = $tokenDataArr['access_token'];
        } else { return json(['msg' => 'ERROR']); }
        $url = 'https://api.weixin.qq.com/wxa/checksession?';
        $url = $url . 'access_token='.$token;
        $url = $url . '&signature='.$sha_session;  // 没人知道原版是什么，session 已经是加密的了
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
}