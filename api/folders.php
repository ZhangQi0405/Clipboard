<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getConnection();

switch ($method) {
    case 'GET':
        getFolders($pdo);
        break;
    case 'POST':
        createFolder($pdo);
        break;
    case 'PUT':
        updateFolder($pdo);
        break;
    case 'DELETE':
        deleteFolder($pdo);
        break;
    default:
        sendError('不支持的请求方法');
}

// 获取所有文件夹
function getFolders($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT f.*, 
                   COUNT(i.id) as item_count
            FROM folders f
            LEFT JOIN items i ON f.id = i.folder_id
            GROUP BY f.id
            ORDER BY f.created_at DESC
        ");
        
        $folders = $stmt->fetchAll();
        sendResponse($folders, true, '');
        
    } catch (Exception $e) {
        sendError('获取文件夹失败', $e->getMessage());
    }
}

// 创建文件夹
function createFolder($pdo) {
    try {
        $data = getRequestData();
        validateRequired($data, ['name']);
        
        $name = sanitizeInput($data['name']);
        $color = sanitizeInput($data['color'] ?? '#34495e');
        
        // 检查文件夹名是否已存在
        $stmt = $pdo->prepare("SELECT id FROM folders WHERE name = ?");
        $stmt->execute([$name]);
        
        if ($stmt->fetch()) {
            sendError('文件夹名称已存在');
        }
        
        // 创建文件夹
        $stmt = $pdo->prepare("
            INSERT INTO folders (name, color, created_at) 
            VALUES (?, ?, NOW())
        ");
        
        $stmt->execute([$name, $color]);
        
        $folderId = $pdo->lastInsertId();
        
        sendResponse([
            'id' => $folderId,
            'name' => $name,
            'color' => $color
        ], true, '文件夹创建成功');
        
    } catch (Exception $e) {
        sendError('创建文件夹失败', $e->getMessage());
    }
}

// 更新文件夹
function updateFolder($pdo) {
    try {
        $data = getRequestData();
        validateRequired($data, ['id', 'name']);
        
        $id = (int)$data['id'];
        $name = sanitizeInput($data['name']);
        $color = sanitizeInput($data['color'] ?? '#34495e');
        
        // 检查文件夹是否存在
        $stmt = $pdo->prepare("SELECT id FROM folders WHERE id = ?");
        $stmt->execute([$id]);
        
        if (!$stmt->fetch()) {
            sendError('文件夹不存在');
        }
        
        // 检查名称是否与其他文件夹冲突
        $stmt = $pdo->prepare("SELECT id FROM folders WHERE name = ? AND id != ?");
        $stmt->execute([$name, $id]);
        
        if ($stmt->fetch()) {
            sendError('文件夹名称已存在');
        }
        
        // 更新文件夹
        $stmt = $pdo->prepare("
            UPDATE folders 
            SET name = ?, color = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        
        $stmt->execute([$name, $color, $id]);
        
        sendResponse([
            'id' => $id,
            'name' => $name,
            'color' => $color
        ], true, '文件夹更新成功');
        
    } catch (Exception $e) {
        sendError('更新文件夹失败', $e->getMessage());
    }
}

// 删除文件夹
function deleteFolder($pdo) {
    try {
        $data = getRequestData();
        validateRequired($data, ['id']);
        
        $id = (int)$data['id'];
        
        // 检查文件夹是否存在
        $stmt = $pdo->prepare("SELECT id FROM folders WHERE id = ?");
        $stmt->execute([$id]);
        
        if (!$stmt->fetch()) {
            sendError('文件夹不存在');
        }
        
        // 开始事务
        $pdo->beginTransaction();

        try {
            // 先删除文件夹中的所有内容
            $stmt = $pdo->prepare("DELETE FROM items WHERE folder_id = ?");
            $stmt->execute([$id]);

            // 删除文件夹
            $stmt = $pdo->prepare("DELETE FROM folders WHERE id = ?");
            $stmt->execute([$id]);

            // 提交事务
            $pdo->commit();
        } catch (Exception $e) {
            // 回滚事务
            $pdo->rollback();
            throw $e;
        }
        
        sendResponse(['id' => $id], true, '文件夹删除成功');
        
    } catch (Exception $e) {
        sendError('删除文件夹失败', $e->getMessage());
    }
}
?>
