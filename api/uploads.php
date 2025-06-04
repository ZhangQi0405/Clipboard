<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// 创建上传目录
$uploadDir = '../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

switch ($method) {
    case 'POST':
        uploadFile($uploadDir);
        break;
    case 'GET':
        getFile($uploadDir);
        break;
    case 'DELETE':
        deleteFile($uploadDir);
        break;
    default:
        sendError('不支持的请求方法');
}

// 上传文件
function uploadFile($uploadDir) {
    try {
        // 处理文件上传
        if (isset($_FILES['file'])) {
            $file = $_FILES['file'];
            
            // 检查上传错误
            if ($file['error'] !== UPLOAD_ERR_OK) {
                $errorMessage = getUploadErrorMessage($file['error']);
                sendError('文件上传失败: ' . $errorMessage);
            }
            
            // 生成唯一文件名
            $fileInfo = pathinfo($file['name']);
            $extension = strtolower($fileInfo['extension']);
            $uniqueName = generateUUID() . '.' . $extension;
            $targetFilePath = $uploadDir . $uniqueName;
            
            // 检查文件类型
            $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', '7z'];
            if (!in_array($extension, $allowedTypes)) {
                sendError('不支持的文件类型');
            }
            
            // 检查文件大小 (限制为10MB)
            $maxFileSize = 10 * 1024 * 1024; // 10MB
            if ($file['size'] > $maxFileSize) {
                sendError('文件大小超过限制 (最大10MB)');
            }
            
            // 移动上传的文件
            if (!move_uploaded_file($file['tmp_name'], $targetFilePath)) {
                sendError('文件移动失败');
            }
            
            // 返回文件信息
            sendResponse([
                'file_id' => basename($uniqueName, '.' . $extension),
                'file_name' => $file['name'],
                'file_type' => $file['type'],
                'file_size' => $file['size'],
                'file_url' => 'uploads/' . $uniqueName
            ], true, '文件上传成功');
        } else {
            // 处理Base64编码的图片数据
            $data = getRequestData();
            if (isset($data['image_data'])) {
                $imageData = $data['image_data'];
                $originalName = $data['file_name'] ?? 'image.png';
                
                // 检查文件大小(限制为10MB)
                $decodedData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData));
                if (strlen($decodedData) > 10 * 1024 * 1024) {
                    sendError('文件大小超过限制 (最大10MB)');
                }
                
                // 从Base64数据提取图片类型
                preg_match('/data:image\/(\w+);base64,/', $imageData, $matches);
                $imageType = $matches[1] ?? 'png';
                
                // 移除base64头部
                $imageData = preg_replace('/data:image\/\w+;base64,/', '', $imageData);
                $imageData = base64_decode($imageData);
                
                // 生成唯一文件名
                $uniqueName = generateUUID() . '.' . $imageType;
                $targetFilePath = $uploadDir . $uniqueName;
                
                // 保存图片
                if (file_put_contents($targetFilePath, $imageData) === false) {
                    sendError('图片保存失败');
                }
                
                // 返回文件信息
                sendResponse([
                    'file_id' => basename($uniqueName, '.' . $imageType),
                    'file_name' => $originalName,
                    'file_type' => 'image/' . $imageType,
                    'file_size' => strlen($imageData),
                    'file_url' => 'uploads/' . $uniqueName
                ], true, '图片上传成功');
            } else {
                sendError('未找到上传文件');
            }
        }
    } catch (Exception $e) {
        sendError('文件上传失败', $e->getMessage());
    }
}

// 获取文件
function getFile($uploadDir) {
    try {
        // 检查文件ID参数
        if (!isset($_GET['file_id'])) {
            sendError('缺少文件ID参数');
        }
        
        $fileId = sanitizeInput($_GET['file_id']);
        
        // 查找文件
        $files = scandir($uploadDir);
        $targetFile = null;
        
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            
            $fileInfo = pathinfo($file);
            $currentFileId = basename($fileInfo['filename']);
            
            if ($currentFileId === $fileId) {
                $targetFile = $file;
                break;
            }
        }
        
        if (!$targetFile) {
            sendError('文件不存在');
        }
        
        // 返回文件信息
        $filePath = $uploadDir . $targetFile;
        sendResponse([
            'file_name' => $targetFile,
            'file_url' => 'uploads/' . $targetFile,
            'file_size' => filesize($filePath)
        ]);
        
    } catch (Exception $e) {
        sendError('获取文件失败', $e->getMessage());
    }
}

// 删除文件
function deleteFile($uploadDir) {
    try {
        $data = getRequestData();
        
        if (!isset($data['file_id'])) {
            sendError('缺少文件ID参数');
        }
        
        $fileId = sanitizeInput($data['file_id']);
        
        // 查找文件
        $files = scandir($uploadDir);
        $targetFile = null;
        
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            
            $fileInfo = pathinfo($file);
            $currentFileId = basename($fileInfo['filename']);
            
            if ($currentFileId === $fileId) {
                $targetFile = $file;
                break;
            }
        }
        
        if (!$targetFile) {
            sendError('文件不存在');
        }
        
        // 删除文件
        $filePath = $uploadDir . $targetFile;
        if (!unlink($filePath)) {
            sendError('文件删除失败');
        }
        
        sendResponse(['file_id' => $fileId], true, '文件删除成功');
        
    } catch (Exception $e) {
        sendError('删除文件失败', $e->getMessage());
    }
}

// 获取上传错误信息
function getUploadErrorMessage($error) {
    switch ($error) {
        case UPLOAD_ERR_INI_SIZE:
            return '文件大小超过系统限制';
        case UPLOAD_ERR_FORM_SIZE:
            return '文件大小超过表单限制';
        case UPLOAD_ERR_PARTIAL:
            return '文件仅部分上传';
        case UPLOAD_ERR_NO_FILE:
            return '没有上传文件';
        case UPLOAD_ERR_NO_TMP_DIR:
            return '临时文件夹不存在';
        case UPLOAD_ERR_CANT_WRITE:
            return '文件写入失败';
        case UPLOAD_ERR_EXTENSION:
            return '文件上传被扩展阻止';
        default:
            return '未知上传错误';
    }
}
?> 