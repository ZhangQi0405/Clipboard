<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getConnection();

switch ($method) {
    case 'GET':
        getItems($pdo);
        break;
    case 'POST':
        createItem($pdo);
        break;
    case 'PUT':
        updateItem($pdo);
        break;
    case 'DELETE':
        deleteItem($pdo);
        break;
    default:
        sendError('不支持的请求方法');
}

// 获取内容项目
function getItems($pdo) {
    try {
        $folderId = $_GET['folder_id'] ?? null;
        $search = $_GET['search'] ?? null;
        
        $sql = "
            SELECT i.*, f.name as folder_name, f.color as folder_color
            FROM items i
            LEFT JOIN folders f ON i.folder_id = f.id
        ";
        
        $params = [];
        $conditions = [];
        
        if ($folderId) {
            $conditions[] = "i.folder_id = ?";
            $params[] = (int)$folderId;
        }
        
        if ($search) {
            $conditions[] = "(i.title LIKE ? OR i.content LIKE ?)";
            $searchTerm = '%' . $search . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(' AND ', $conditions);
        }
        
        $sql .= " ORDER BY i.created_at DESC LIMIT 100";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        $items = $stmt->fetchAll();
        
        // 检查附件URL并添加文件大小
        foreach ($items as &$item) {
            if (!empty($item['attachment_url'])) {
                // 如果没有file_size字段或为0，尝试获取实际文件大小
                if (empty($item['file_size'])) {
                    $filePath = '../' . $item['attachment_url'];
                    if (file_exists($filePath)) {
                        $item['file_size'] = filesize($filePath);
                    }
                }
            }
        }
        
        sendResponse($items, true, '');
        
    } catch (Exception $e) {
        sendError('获取内容失败', $e->getMessage());
    }
}

// 创建内容项目
function createItem($pdo) {
    try {
        $data = getRequestData();
        validateRequired($data, ['content']);
        
        $title = sanitizeInput($data['title'] ?? '');
        $content = sanitizeInput($data['content']);
        $folderId = isset($data['folder_id']) && $data['folder_id'] ? (int)$data['folder_id'] : null;
        
        // 处理附件数据
        $hasAttachment = isset($data['attachment']) && !empty($data['attachment']);
        $attachmentId = $hasAttachment ? sanitizeInput($data['attachment']['file_id']) : null;
        $attachmentName = $hasAttachment ? sanitizeInput($data['attachment']['file_name']) : null;
        $attachmentType = $hasAttachment ? sanitizeInput($data['attachment']['file_type']) : null;
        $attachmentUrl = $hasAttachment ? sanitizeInput($data['attachment']['file_url']) : null;
        
        // 如果指定了文件夹，检查文件夹是否存在
        if ($folderId) {
            $stmt = $pdo->prepare("SELECT id FROM folders WHERE id = ?");
            $stmt->execute([$folderId]);
            
            if (!$stmt->fetch()) {
                sendError('指定的文件夹不存在');
            }
        }
        
        // 创建内容项目
        $stmt = $pdo->prepare("
            INSERT INTO items (
                title, content, folder_id, created_at, 
                attachment_id, attachment_name, attachment_type, attachment_url
            ) 
            VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $title, $content, $folderId, 
            $attachmentId, $attachmentName, $attachmentType, $attachmentUrl
        ]);
        
        $itemId = $pdo->lastInsertId();
        
        sendResponse([
            'id' => $itemId,
            'title' => $title,
            'content' => $content,
            'folder_id' => $folderId,
            'attachment_id' => $attachmentId,
            'attachment_name' => $attachmentName,
            'attachment_type' => $attachmentType,
            'attachment_url' => $attachmentUrl
        ], true, '内容保存成功');
        
    } catch (Exception $e) {
        sendError('保存内容失败', $e->getMessage());
    }
}

// 更新内容项目
function updateItem($pdo) {
    try {
        $data = getRequestData();
        validateRequired($data, ['id', 'content']);
        
        $id = (int)$data['id'];
        $title = sanitizeInput($data['title'] ?? '');
        $content = sanitizeInput($data['content']);
        
        // 处理附件数据
        $updateAttachment = isset($data['update_attachment']) && $data['update_attachment'];
        $attachmentFields = "";
        $params = [$title, $content];
        
        if ($updateAttachment) {
            $hasAttachment = isset($data['attachment']) && !empty($data['attachment']);
            $attachmentId = $hasAttachment ? sanitizeInput($data['attachment']['file_id']) : null;
            $attachmentName = $hasAttachment ? sanitizeInput($data['attachment']['file_name']) : null;
            $attachmentType = $hasAttachment ? sanitizeInput($data['attachment']['file_type']) : null;
            $attachmentUrl = $hasAttachment ? sanitizeInput($data['attachment']['file_url']) : null;
            
            $attachmentFields = ", attachment_id = ?, attachment_name = ?, attachment_type = ?, attachment_url = ?";
            $params = array_merge($params, [$attachmentId, $attachmentName, $attachmentType, $attachmentUrl]);
        }
        
        // 检查内容项目是否存在
        $stmt = $pdo->prepare("SELECT id FROM items WHERE id = ?");
        $stmt->execute([$id]);
        
        if (!$stmt->fetch()) {
            sendError('内容不存在');
        }
        
        // 更新内容项目
        $stmt = $pdo->prepare("
            UPDATE items 
            SET title = ?, content = ?, updated_at = NOW() 
            {$attachmentFields}
            WHERE id = ?
        ");
        
        $params[] = $id;
        $stmt->execute($params);
        
        $response = [
            'id' => $id,
            'title' => $title,
            'content' => $content
        ];
        
        if ($updateAttachment) {
            $response['attachment_id'] = $attachmentId;
            $response['attachment_name'] = $attachmentName;
            $response['attachment_type'] = $attachmentType;
            $response['attachment_url'] = $attachmentUrl;
        }
        
        sendResponse($response, true, '内容更新成功');
        
    } catch (Exception $e) {
        sendError('更新内容失败', $e->getMessage());
    }
}

// 删除内容项目
function deleteItem($pdo) {
    try {
        $data = getRequestData();
        validateRequired($data, ['id']);
        
        $id = (int)$data['id'];
        
        // 检查内容项目是否存在
        $stmt = $pdo->prepare("SELECT id, attachment_id, attachment_url FROM items WHERE id = ?");
        $stmt->execute([$id]);
        
        $item = $stmt->fetch();
        if (!$item) {
            sendError('内容不存在');
        }
        
        // 如果有附件，尝试删除文件
        if (!empty($item['attachment_id']) && !empty($item['attachment_url'])) {
            $attachmentPath = '../' . $item['attachment_url'];
            if (file_exists($attachmentPath)) {
                @unlink($attachmentPath);
            }
        }
        
        // 删除内容项目
        $stmt = $pdo->prepare("DELETE FROM items WHERE id = ?");
        $stmt->execute([$id]);
        
        sendResponse(['id' => $id], true, '内容删除成功');
        
    } catch (Exception $e) {
        sendError('删除内容失败', $e->getMessage());
    }
}
?>
