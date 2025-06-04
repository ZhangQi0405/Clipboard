<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>共享剪贴板 - 安装向导</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 30%, #90caf9 70%, #64b5f6 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .install-container {
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(36, 172, 242, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.4);
        }
        
        .install-header {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
        }
        
        .install-header h1 {
            color: #24acf2;
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .install-header p {
            color: #4a5568;
            font-size: 1.1rem;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #24acf2;
            box-shadow: 0 0 0 3px rgba(36, 172, 242, 0.1);
        }
        
        .btn {
            background: #24acf2;
            color: white;
            border: 1px solid #1e90d4;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            background: #1e90d4;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(36, 172, 242, 0.2);
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            font-weight: 500;
        }
        
        .result.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .result.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .sql-preview {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .note {
            background: rgba(36, 172, 242, 0.1);
            border: 1px solid rgba(36, 172, 242, 0.2);
            color: #1e90d4;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .note strong {
            display: block;
            margin-bottom: 5px;
        }
        
        a {
            color: #24acf2;
            text-decoration: none;
            font-weight: 500;
        }
        
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="install-container">
        <div class="install-header">
            <h1>🗂️ 共享剪贴板</h1>
            <p>数据库安装向导</p>
        </div>

        <?php if (!isset($_POST['install'])): ?>
        <div class="note">
            <strong>安装说明：</strong>
            请确保您已经在宝塔面板中创建了MySQL数据库，并填写正确的数据库连接信息。
        </div>

        <form method="post">
            <div class="form-group">
                <label for="db_host">数据库主机</label>
                <input type="text" id="db_host" name="db_host" value="localhost" required>
            </div>

            <div class="form-group">
                <label for="db_name">数据库名称</label>
                <input type="text" id="db_name" name="db_name" value="clipboard_db" required>
            </div>

            <div class="form-group">
                <label for="db_user">数据库用户名</label>
                <input type="text" id="db_user" name="db_user" value="root" required>
            </div>

            <div class="form-group">
                <label for="db_pass">数据库密码</label>
                <input type="password" id="db_pass" name="db_pass" placeholder="请输入数据库密码">
            </div>

            <button type="submit" name="install" class="btn">开始安装</button>
        </form>

        <div class="sql-preview">
            <strong>将要执行的SQL语句：</strong><br><br>
            CREATE DATABASE IF NOT EXISTS clipboard_db DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;<br><br>
            
            CREATE TABLE folders (<br>
            &nbsp;&nbsp;id INT AUTO_INCREMENT PRIMARY KEY,<br>
            &nbsp;&nbsp;name VARCHAR(100) NOT NULL UNIQUE,<br>
            &nbsp;&nbsp;color VARCHAR(7) DEFAULT '#34495e',<br>
            &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br>
            &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP<br>
            );<br><br>
            
            CREATE TABLE items (<br>
            &nbsp;&nbsp;id INT AUTO_INCREMENT PRIMARY KEY,<br>
            &nbsp;&nbsp;title VARCHAR(200) DEFAULT '',<br>
            &nbsp;&nbsp;content TEXT NOT NULL,<br>
            &nbsp;&nbsp;folder_id INT NULL,<br>
            &nbsp;&nbsp;attachment_id VARCHAR(36) NULL,<br>
            &nbsp;&nbsp;attachment_name VARCHAR(255) NULL,<br>
            &nbsp;&nbsp;attachment_type VARCHAR(100) NULL,<br>
            &nbsp;&nbsp;attachment_url VARCHAR(255) NULL,<br>
            &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br>
            &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,<br>
            &nbsp;&nbsp;FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL<br>
            );
        </div>

        <?php else: ?>
        <?php
        $db_host = $_POST['db_host'];
        $db_name = $_POST['db_name'];
        $db_user = $_POST['db_user'];
        $db_pass = $_POST['db_pass'];

        try {
            // 连接MySQL服务器
            $pdo = new PDO("mysql:host=$db_host;charset=utf8mb4", $db_user, $db_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);

            // 创建数据库
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            // 选择数据库
            $pdo->exec("USE `$db_name`");

            // 创建文件夹表
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS folders (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    color VARCHAR(7) DEFAULT '#34495e',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            // 创建内容项目表
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(200) DEFAULT '',
                    content TEXT NOT NULL,
                    folder_id INT NULL,
                    attachment_id VARCHAR(36) NULL,
                    attachment_name VARCHAR(255) NULL,
                    attachment_type VARCHAR(100) NULL,
                    attachment_url VARCHAR(255) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            // 更新配置文件
            $config_content = "<?php
// 数据库配置
define('DB_HOST', '$db_host');
define('DB_NAME', '$db_name');
define('DB_USER', '$db_user');
define('DB_PASS', '$db_pass');

// 设置时区
date_default_timezone_set('Asia/Shanghai');

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 处理预检请求
if (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 错误报告设置
error_reporting(E_ALL);
ini_set('display_errors', 0);

// 自定义错误处理
function handleError(\$errno, \$errstr, \$errfile, \$errline) {
    \$error = [
        'success' => false,
        'message' => '服务器内部错误',
        'error' => \$errstr,
        'file' => \$errfile,
        'line' => \$errline
    ];
    
    echo json_encode(\$error, JSON_UNESCAPED_UNICODE);
    exit();
}

set_error_handler('handleError');

// 数据库连接函数
function getConnection() {
    try {
        \$pdo = new PDO(
            \"mysql:host=\" . DB_HOST . \";dbname=\" . DB_NAME . \";charset=utf8mb4\",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        return \$pdo;
    } catch (PDOException \$e) {
        \$error = [
            'success' => false,
            'message' => '数据库连接失败',
            'error' => \$e->getMessage()
        ];
        echo json_encode(\$error, JSON_UNESCAPED_UNICODE);
        exit();
    }
}

// 响应函数
function sendResponse(\$data, \$success = true, \$message = '') {
    \$response = [
        'success' => \$success,
        'message' => \$message,
        'data' => \$data
    ];
    
    echo json_encode(\$response, JSON_UNESCAPED_UNICODE);
    exit();
}

function sendError(\$message, \$error = null) {
    \$response = [
        'success' => false,
        'message' => \$message
    ];
    
    if (\$error) {
        \$response['error'] = \$error;
    }
    
    echo json_encode(\$response, JSON_UNESCAPED_UNICODE);
    exit();
}

// 获取请求数据
function getRequestData() {
    \$input = file_get_contents('php://input');
    return json_decode(\$input, true);
}

// 验证必需字段
function validateRequired(\$data, \$fields) {
    foreach (\$fields as \$field) {
        if (!isset(\$data[\$field]) || trim(\$data[\$field]) === '') {
            sendError(\"字段 '{\$field}' 是必需的\");
        }
    }
}

// 清理输入数据
function sanitizeInput(\$data) {
    if (is_array(\$data)) {
        return array_map('sanitizeInput', \$data);
    }
    return htmlspecialchars(trim(\$data), ENT_QUOTES, 'UTF-8');
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
?>";

            file_put_contents('./api/config.php', $config_content);

            echo '<div class="result success">';
            echo '<strong>✅ 安装成功！</strong><br>';
            echo '数据库和表已成功创建，配置文件已更新。<br><br>';
            echo '<strong>下一步：</strong><br>';
            echo '1. 删除此安装文件 (install.php)<br>';
            echo '2. 访问 <a href="index.html">index.html</a> 开始使用<br>';
            echo '3. 确保 api/ 目录有适当的读写权限';
            echo '</div>';

        } catch (Exception $e) {
            echo '<div class="result error">';
            echo '<strong>❌ 安装失败！</strong><br>';
            echo '错误信息：' . htmlspecialchars($e->getMessage()) . '<br><br>';
            echo '<strong>可能的解决方案：</strong><br>';
            echo '1. 检查数据库连接信息是否正确<br>';
            echo '2. 确保数据库用户有创建数据库和表的权限<br>';
            echo '3. 检查MySQL服务是否正常运行';
            echo '</div>';
        }
        ?>
        <?php endif; ?>
    </div>
</body>
</html>
