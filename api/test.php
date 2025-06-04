<?php
require_once 'config.php';

try {
    $pdo = getConnection();
    
    // 测试数据库连接
    $stmt = $pdo->query("SELECT 1");
    
    sendResponse([
        'status' => 'ok',
        'timestamp' => date('Y-m-d H:i:s'),
        'message' => 'API服务正常运行'
    ], true, 'API连接成功');
    
} catch (Exception $e) {
    sendError('API测试失败', $e->getMessage());
}
?>
