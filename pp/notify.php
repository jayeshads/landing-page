<?php
$ip = $_SERVER['REMOTE_ADDR'] ?? 'N/A';
$agent = $_SERVER['HTTP_USER_AGENT'] ?? 'N/A';
$time = date("d-m-Y h:i:s A");

$msg  = "💌 Someone clicked LAST THINK\n\n";
$msg .= "🌐 IP: $ip\n";
$msg .= "📱 Device: $agent\n";
$msg .= "⏰ Time: $time";

$botToken = "8501752705:AAH9jUmAFhqyXcY3HArFCqP0Ep_M61o2K9Y";
$chatId   = "7347711725";

$url = "https://api.telegram.org/bot$botToken/sendMessage";

$data = [
  'chat_id' => $chatId,
  'text'    => $msg
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);

if ($response === false) {
  echo "cURL Error: " . curl_error($ch);
} else {
  echo "Sent OK";
}

curl_close($ch);
?>
