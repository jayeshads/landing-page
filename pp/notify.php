<?php
$ip = $_SERVER['REMOTE_ADDR'];
$agent = $_SERVER['HTTP_USER_AGENT'];
$time = date("d-m-Y h:i:s A");

$msg  = "💌 Someone clicked LAST THINK\n\n";
$msg .= "🌐 IP: $ip\n";
$msg .= "📱 Device: $agent\n";
$msg .= "⏰ Time: $time";

$botToken = "7587151467:AAHbnbxj8zngwreQQUg4Z8w1pcoV_WOjiP8";	
$chatId   = "7347711725";

$url = "https://api.telegram.org/bot$botToken/sendMessage";

file_get_contents($url."?chat_id=".$chatId."&text=".urlencode($msg));
?>
