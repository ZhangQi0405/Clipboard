<?php
// 数据库配置
define('DB_HOST', 'localhost');
define('DB_NAME', 'clipboard_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// 设置时区
date_default_timezone_set('Asia/Shanghai');

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 错误报告设置
error_reporting(E_ALL);
ini_set('display_errors', 0);

// 自定义错误处理
function handleError($errno, $errstr, $errfile, $errline) {
    $error = [
        'success' => false,
        'message' => '服务器内部错误',
        'error' => $errstr,
        'file' => $errfile,
        'line' => $errline
    ];
    
    echo json_encode($error, JSON_UNESCAPED_UNICODE);
    exit();
}

set_error_handler('handleError');

// 数据库连接函数
function getConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        $error = [
            'success' => false,
            'message' => '数据库连接失败',
            'error' => $e->getMessage()
        ];
        echo json_encode($error, JSON_UNESCAPED_UNICODE);
        exit();
    }
}

// 响应函数
function sendResponse($data, $success = true, $message = '') {
    $response = [
        'success' => $success,
        'message' => $message,
        'data' => $data
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

function sendError($message, $error = null) {
    $response = [
        'success' => false,
        'message' => $message
    ];
    
    if ($error) {
        $response['error'] = $error;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// 获取请求数据
function getRequestData() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

// 验证必需字段
function validateRequired($data, $fields) {
    foreach ($fields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            sendError("字段 '{$field}' 是必需的");
        }
    }
}

// 清理输入数据
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

// 生成UUID
function generateUUID() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
?>
