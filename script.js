// 全局变量
let currentFolder = null;
let editingItem = null;
let selectedFolderColor = '#34495e';
let editingFolder = null; // 添加编辑文件夹变量
let currentAttachment = null; // 当前附件
let editingAttachment = null; // 编辑时的附件

// API基础URL
const API_BASE = './api';

// DOM元素
const elements = {
    folderTree: document.getElementById('folderTree'),
    itemsContainer: document.getElementById('itemsContainer'),
    itemTitle: document.getElementById('itemTitle'),
    itemContent: document.getElementById('itemContent'),
    folderSelect: document.getElementById('folderSelect'),
    currentFolderTitle: document.getElementById('currentFolderTitle'),
    itemCount: document.getElementById('itemCount'),
    lastUpdate: document.getElementById('lastUpdate'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    searchInput: document.getElementById('searchInput'),
    notification: document.getElementById('notification'),
    mobileFolderList: document.getElementById('mobileFolderList'),
    
    // 文件上传元素
    fileInput: document.getElementById('fileInput'),
    attachmentPreview: document.getElementById('attachmentPreview'),
    editFileInput: document.getElementById('editFileInput'),
    editAttachmentPreview: document.getElementById('editAttachmentPreview'),
    
    // 图片预览模态框
    imagePreviewModal: document.getElementById('imagePreviewModal'),
    previewImage: document.getElementById('previewImage'),
    closeImagePreview: document.getElementById('closeImagePreview'),
    downloadImage: document.getElementById('downloadImage'),
    
    // 模态框
    folderModal: document.getElementById('folderModal'),
    editModal: document.getElementById('editModal'),
    editFolderModal: document.getElementById('editFolderModal'),
    selectFolderModal: document.getElementById('selectFolderModal'),
    folderNameInput: document.getElementById('folderNameInput'),
    editTitle: document.getElementById('editTitle'),
    editContent: document.getElementById('editContent'),
    editFolderNameInput: document.getElementById('editFolderNameInput'),
    
    // 按钮
    addFolderBtn: document.getElementById('addFolderBtn'),
    editFolderBtn: document.getElementById('editFolderBtn'),
    selectFolderBtn: document.getElementById('selectFolderBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    saveItemBtn: document.getElementById('saveItemBtn'),
    clearInputBtn: document.getElementById('clearInputBtn'),
    confirmFolderBtn: document.getElementById('confirmFolderBtn'),
    cancelFolderBtn: document.getElementById('cancelFolderBtn'),
    closeFolderModal: document.getElementById('closeFolderModal'),
    confirmEditBtn: document.getElementById('confirmEditBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    closeEditModal: document.getElementById('closeEditModal'),
    deleteItemBtn: document.getElementById('deleteItemBtn'),
    confirmEditFolderBtn: document.getElementById('confirmEditFolderBtn'),
    cancelEditFolderBtn: document.getElementById('cancelEditFolderBtn'),
    closeEditFolderModal: document.getElementById('closeEditFolderModal'),
    deleteFolderBtn: document.getElementById('deleteFolderBtn'),
    closeSelectFolderModal: document.getElementById('closeSelectFolderModal'),
    cancelSelectFolderBtn: document.getElementById('cancelSelectFolderBtn')
};

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    bindEvents();
    loadData();
});

// 初始化应用
function initializeApp() {
    updateStatus('连接中...', 'connecting');
    
    // 检查API连接
    checkApiConnection();
    
    // 设置自动刷新
    setInterval(loadData, 30000); // 每30秒刷新一次
}

// 绑定事件
function bindEvents() {
    // 按钮事件
    elements.addFolderBtn.addEventListener('click', showFolderModal);
    elements.editFolderBtn.addEventListener('click', showEditFolderList);
    elements.selectFolderBtn.addEventListener('click', showSelectFolderModal);
    elements.refreshBtn.addEventListener('click', loadData);
    elements.saveItemBtn.addEventListener('click', saveItem);
    elements.clearInputBtn.addEventListener('click', clearInput);
    
    // 文件上传事件
    elements.fileInput.addEventListener('change', handleFileUpload);
    elements.editFileInput.addEventListener('change', handleEditFileUpload);
    elements.closeImagePreview.addEventListener('click', hideImagePreview);
    
    // 拖拽上传事件
    elements.itemContent.addEventListener('dragover', handleDragOver);
    elements.itemContent.addEventListener('drop', handleDrop);
    elements.editContent.addEventListener('dragover', handleDragOver);
    elements.editContent.addEventListener('drop', handleEditDrop);
    
    // 粘贴事件处理
    elements.itemContent.addEventListener('paste', handlePaste);
    elements.editContent.addEventListener('paste', handleEditPaste);
    
    // 模态框事件
    elements.confirmFolderBtn.addEventListener('click', createFolder);
    elements.cancelFolderBtn.addEventListener('click', hideFolderModal);
    elements.closeFolderModal.addEventListener('click', hideFolderModal);
    
    elements.confirmEditBtn.addEventListener('click', updateItem);
    elements.cancelEditBtn.addEventListener('click', hideEditModal);
    elements.closeEditModal.addEventListener('click', hideEditModal);
    elements.deleteItemBtn.addEventListener('click', deleteItem);
    
    // 编辑文件夹模态框事件
    elements.confirmEditFolderBtn.addEventListener('click', updateFolder);
    elements.cancelEditFolderBtn.addEventListener('click', hideEditFolderModal);
    elements.closeEditFolderModal.addEventListener('click', hideEditFolderModal);
    elements.deleteFolderBtn.addEventListener('click', deleteFolder);
    
    // 选择文件夹模态框事件
    elements.closeSelectFolderModal.addEventListener('click', hideSelectFolderModal);
    elements.cancelSelectFolderBtn.addEventListener('click', hideSelectFolderModal);
    
    // 搜索事件
    elements.searchInput.addEventListener('input', handleSearch);
    
    // 颜色选择事件
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            const container = this.closest('.color-options');
            container.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedFolderColor = this.dataset.color;
        });
    });
    
    // 模态框背景点击关闭
    elements.folderModal.addEventListener('click', function(e) {
        if (e.target === this) hideFolderModal();
    });
    
    elements.editModal.addEventListener('click', function(e) {
        if (e.target === this) hideEditModal();
    });
    
    elements.editFolderModal.addEventListener('click', function(e) {
        if (e.target === this) hideEditFolderModal();
    });
    
    elements.selectFolderModal.addEventListener('click', function(e) {
        if (e.target === this) hideSelectFolderModal();
    });
    
    elements.imagePreviewModal.addEventListener('click', function(e) {
        if (e.target === this) hideImagePreview();
    });
    
    // 键盘事件
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideFolderModal();
            hideEditModal();
            hideEditFolderModal();
            hideSelectFolderModal();
            hideImagePreview();
        }
        
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveItem();
        }
    });
}

// 处理粘贴事件
function handlePaste(e) {
    // 检查是否有剪贴板数据
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;
    
    // 检查是否有文件
    if (clipboardData.files && clipboardData.files.length > 0) {
        const file = clipboardData.files[0];
        if (isAllowedFileType(file)) {
            handleUploadedFile(file);
            e.preventDefault(); // 阻止默认粘贴行为
        }
        return;
    }
    
    // 检查是否有图片数据
    if (clipboardData.items) {
        for (let i = 0; i < clipboardData.items.length; i++) {
            if (clipboardData.items[i].type.indexOf('image') !== -1) {
                const file = clipboardData.items[i].getAsFile();
                handleUploadedFile(file);
                e.preventDefault(); // 阻止默认粘贴行为
                break;
            }
        }
    }
}

// 处理编辑时的粘贴事件
function handleEditPaste(e) {
    // 检查是否有剪贴板数据
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;
    
    // 检查是否有文件
    if (clipboardData.files && clipboardData.files.length > 0) {
        const file = clipboardData.files[0];
        if (isAllowedFileType(file)) {
            handleEditUploadedFile(file);
            e.preventDefault(); // 阻止默认粘贴行为
        }
        return;
    }
    
    // 检查是否有图片数据
    if (clipboardData.items) {
        for (let i = 0; i < clipboardData.items.length; i++) {
            if (clipboardData.items[i].type.indexOf('image') !== -1) {
                const file = clipboardData.items[i].getAsFile();
                handleEditUploadedFile(file);
                e.preventDefault(); // 阻止默认粘贴行为
                break;
            }
        }
    }
}

// 处理上传的文件（创建时）
function handleUploadedFile(file) {
    // 检查文件类型
    if (!isAllowedFileType(file)) {
        showNotification('不支持的文件类型', 'error');
        return;
    }
    
    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) { // 10MB
        showNotification('文件大小超过限制 (最大10MB)', 'error');
        return;
    }
    
    // 如果是图片
    if (file.type.startsWith('image/')) {
        handleImageFile(file);
    } else {
        // 处理其他类型文件
        uploadFile(file);
    }
}

// 处理上传的文件（编辑时）
function handleEditUploadedFile(file) {
    // 检查文件类型
    if (!isAllowedFileType(file)) {
        showNotification('不支持的文件类型', 'error');
        return;
    }
    
    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) { // 10MB
        showNotification('文件大小超过限制 (最大10MB)', 'error');
        return;
    }
    
    // 如果是图片
    if (file.type.startsWith('image/')) {
        handleEditImageFile(file);
    } else {
        // 处理其他类型文件
        uploadEditFile(file);
    }
}

// 处理图片文件
function handleImageFile(file) {
    // 判断文件类型和大小
    if (!file || !file.type.startsWith('image/')) {
        showNotification('不支持的文件类型', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
        showNotification('文件大小超过限制 (最大10MB)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // 设置当前附件
        const imageData = e.target.result;
        uploadBase64Image(imageData, file.name);
    };
    reader.readAsDataURL(file);
}

// 处理编辑时的图片文件
function handleEditImageFile(file) {
    // 判断文件类型和大小
    if (!file || !file.type.startsWith('image/')) {
        showNotification('不支持的文件类型', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
        showNotification('文件大小超过限制 (最大10MB)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // 设置当前附件
        const imageData = e.target.result;
        uploadBase64ImageForEdit(imageData, file.name);
    };
    reader.readAsDataURL(file);
}

// 上传Base64编码的图片（编辑时）
function uploadBase64ImageForEdit(imageData, fileName) {
    try {
        fetch(`${API_BASE}/uploads.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_data: imageData,
                file_name: fileName
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // 保存附件信息
                editingAttachment = result.data;
                // 显示附件预览
                renderAttachmentPreview(result.data, elements.editAttachmentPreview);
            } else {
                showNotification(result.message || '上传图片失败', 'error');
            }
        })
        .catch(error => {
            console.error('上传图片失败:', error);
            showNotification('上传图片失败', 'error');
        });
    } catch (error) {
        console.error('上传图片失败:', error);
        showNotification('上传图片失败', 'error');
    }
}

// 渲染附件预览
function renderAttachmentPreview(attachment, container) {
    if (!attachment || !container) return;
    
    const isImage = attachment.file_type && attachment.file_type.startsWith('image/');
    const fileIcon = getFileIcon(attachment.file_type);
    const fileSize = formatFileSize(parseInt(attachment.file_size || 0));
    
    let previewHtml = `
        <div class="attachment-info">
            <div class="file-name">
                <i class="${fileIcon} file-icon"></i>
                ${escapeHtml(attachment.file_name)}
            </div>
            <div class="file-meta">${fileSize} · ${attachment.file_type || '未知类型'}</div>
        </div>
        <div class="attachment-actions">
            <button class="action-btn delete-attachment" title="删除附件" onclick="removeAttachment(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.innerHTML = previewHtml;
    container.style.display = 'flex';
    
    // 如果是图片，添加图片预览
    if (isImage) {
        const img = document.createElement('img');
        img.src = attachment.file_url;
        img.alt = attachment.file_name;
        img.classList.add('preview-thumbnail');
        img.style.marginRight = '10px';
        img.style.maxHeight = '60px';
        container.insertBefore(img, container.firstChild);
    }
}

// 移除附件
function removeAttachment(button) {
    const container = button.closest('.attachment-preview');
    const isEditMode = container.id === 'editAttachmentPreview';
    
    // 根据模式确定要清除哪个附件变量
    if (isEditMode) {
        editingAttachment = null;
    } else {
        currentAttachment = null;
    }
    
    // 隐藏预览
    container.style.display = 'none';
    container.innerHTML = '';
}

// 检查文件类型是否允许
function isAllowedFileType(file) {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
        'application/pdf', 
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip', 'application/x-zip-compressed', 'application/x-7z-compressed',
        'application/vnd.rar', 'application/octet-stream'
    ];
    
    // 检查MIME类型
    if (allowedTypes.includes(file.type)) {
        return true;
    }
    
    // 检查文件扩展名
    const extension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', '7z'];
    
    return allowedExtensions.includes(extension);
}

// 获取文件图标
function getFileIcon(fileType) {
    if (!fileType) return 'fas fa-file';
    
    if (fileType.startsWith('image/')) return 'fas fa-file-image';
    if (fileType.includes('pdf')) return 'fas fa-file-pdf';
    if (fileType.includes('doc')) return 'fas fa-file-word';
    if (fileType.includes('xls')) return 'fas fa-file-excel';
    if (fileType.includes('text') || fileType.includes('txt')) return 'fas fa-file-alt';
    if (fileType.includes('zip') || fileType.includes('compressed') || fileType === 'application/octet-stream') return 'fas fa-file-archive';
    
    return 'fas fa-file';
}

// 格式化文件大小
function formatFileSize(size) {
    if (!size) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;
    let fileSize = size;
    
    while (fileSize >= 1024 && index < units.length - 1) {
        fileSize /= 1024;
        index++;
    }
    
    return `${fileSize.toFixed(1)} ${units[index]}`;
}

// 显示图片预览
function showImagePreview(url, fileName) {
    elements.previewImage.src = url;
    elements.downloadImage.href = url;
    elements.downloadImage.download = fileName || 'image.png';
    elements.imagePreviewModal.classList.add('show');
}

// 隐藏图片预览
function hideImagePreview() {
    elements.imagePreviewModal.classList.remove('show');
}

// 检查API连接
async function checkApiConnection() {
    try {
        const response = await fetch(`${API_BASE}/test.php`);
        if (response.ok) {
            updateStatus('已连接', 'connected');
        } else {
            updateStatus('连接失败', 'error');
        }
    } catch (error) {
        updateStatus('连接失败', 'error');
        console.error('API连接失败:', error);
    }
}

// 更新状态
function updateStatus(text, status) {
    elements.statusText.textContent = text;
    elements.statusDot.className = `status-dot ${status}`;
}

// 加载数据
async function loadData() {
    try {
        await Promise.all([
            loadFolders(),
            loadItems()
        ]);

        updateStatus('已连接', 'connected');
    } catch (error) {
        console.error('加载数据失败:', error);
        updateStatus('加载失败', 'error');
        showNotification('加载数据失败', 'error');
    }
}

// 加载文件夹
async function loadFolders() {
    try {
        const response = await fetch(`${API_BASE}/folders.php`);
        const result = await response.json();

        // 检查API响应格式
        const folders = result.success ? (result.data || []) : [];

        renderFolders(folders);
        updateFolderSelect(folders);
    } catch (error) {
        console.error('加载文件夹失败:', error);
    }
}

// 加载内容项目
async function loadItems() {
    try {
        const url = currentFolder
            ? `${API_BASE}/items.php?folder_id=${currentFolder.id}`
            : `${API_BASE}/items.php`;

        const response = await fetch(url);
        const result = await response.json();

        // 检查API响应格式
        const items = result.success ? (result.data || []) : [];

        renderItems(items);
        updateItemCount(items.length);
        updateLastUpdateFromItems(items);
    } catch (error) {
        console.error('加载内容失败:', error);
    }
}

// 渲染文件夹
function renderFolders(folders) {
    const html = `
        <div class="folder-item ${!currentFolder ? 'active' : ''}" onclick="selectFolder(null)">
            <div class="item-title">
                <i class="fas fa-home"></i> 全部内容
            </div>
        </div>
        ${folders.map(folder => `
            <div class="folder-item ${currentFolder && currentFolder.id === folder.id ? 'active' : ''}" 
                 onclick="selectFolder(${JSON.stringify(folder).replace(/"/g, '&quot;')})"
                 style="border-left-color: ${folder.color}">
                <div class="item-title">
                    <i class="fas fa-folder" style="color: ${folder.color}"></i> ${escapeHtml(folder.name)}
                </div>
                <div class="item-meta">${folder.item_count || 0} 条内容</div>
            </div>
        `).join('')}
    `;
    
    elements.folderTree.innerHTML = html;
}

// 渲染内容项目
function renderItems(items) {
    if (items.length === 0) {
        elements.itemsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <i class="fas fa-clipboard" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>暂无内容</p>
                <p style="font-size: 14px; margin-top: 10px;">在右侧输入框中添加您的第一条内容</p>
            </div>
        `;
        return;
    }
    
    const html = items.map(item => {
        // 检查是否有附件
        let attachmentHtml = '';
        if (item.attachment_url) {
            const isImage = item.attachment_type && item.attachment_type.startsWith('image/');
            const fileIcon = getFileIcon(item.attachment_type);
            const fileSize = formatFileSize(parseInt(item.file_size || 0));
            
            if (isImage) {
                attachmentHtml = `
                    <div class="content-item-attachment">
                        <div class="file-info">
                            <a href="javascript:void(0);" class="file-name" onclick="event.stopPropagation(); showImagePreview('${item.attachment_url}', '${escapeHtml(item.attachment_name)}')">
                                <i class="${fileIcon} file-icon"></i>
                                ${escapeHtml(item.attachment_name)}
                            </a>
                            <span class="file-size">${fileSize}</span>
                        </div>
                        <div class="attachment-thumbnail-container">
                            <img src="${item.attachment_url}" alt="${escapeHtml(item.attachment_name)}" class="attachment-thumbnail" onclick="event.stopPropagation(); showImagePreview('${item.attachment_url}', '${escapeHtml(item.attachment_name)}')">
                            <span class="zoom-icon" onclick="event.stopPropagation(); showImagePreview('${item.attachment_url}', '${escapeHtml(item.attachment_name)}')">
                                <i class="fas fa-search-plus"></i>
                            </span>
                        </div>
                    </div>
                `;
            } else {
                attachmentHtml = `
                    <div class="content-item-attachment">
                        <div class="file-info">
                            <a href="${item.attachment_url}" class="file-name" download="${escapeHtml(item.attachment_name)}" onclick="event.stopPropagation();">
                                <i class="${fileIcon} file-icon"></i>
                                ${escapeHtml(item.attachment_name)}
                            </a>
                            <span class="file-size">${fileSize}</span>
                        </div>
                    </div>
                `;
            }
        }
        
        return `
        <div class="content-item" onclick="editItem(${JSON.stringify(item).replace(/"/g, '&quot;')})">
            <div class="content-item-header">
                <div>
                    <div class="content-item-title">${escapeHtml(item.title || '无标题')}</div>
                    <div class="content-item-meta">
                        ${formatDate(item.created_at)} 
                        ${item.folder_name ? `• ${escapeHtml(item.folder_name)}` : ''}
                    </div>
                </div>
                <div class="content-item-actions">
                    <button class="action-btn copy-btn" onclick="event.stopPropagation(); copyToClipboard('${escapeHtml(item.content).replace(/'/g, '\\\'')}')" title="复制">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="event.stopPropagation(); editItem(${JSON.stringify(item).replace(/"/g, '&quot;')})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
            <div class="content-item-content">${escapeHtml(item.content).substring(0, 200)}${item.content.length > 200 ? '...' : ''}</div>
                ${attachmentHtml}
        </div>
        `;
    }).join('');
    
    elements.itemsContainer.innerHTML = html;
}

// 更新文件夹选择器
function updateFolderSelect(folders) {
    const html = `
        <option value="">选择文件夹（可选）</option>
        ${folders.map(folder => `
            <option value="${folder.id}">${escapeHtml(folder.name)}</option>
        `).join('')}
    `;
    
    elements.folderSelect.innerHTML = html;
}

// 选择文件夹
function selectFolder(folder) {
    currentFolder = folder;
    elements.currentFolderTitle.textContent = folder ? folder.name : '全部内容';
    loadItems();
    renderFolders([]); // 重新渲染以更新活动状态
    loadFolders(); // 重新加载文件夹数据
}

// 显示文件夹模态框
function showFolderModal() {
    elements.folderModal.classList.add('show');
    elements.folderNameInput.value = '';
    
    // 重置颜色选择
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === '#34495e') {
            option.classList.add('selected');
        }
    });
    selectedFolderColor = '#34495e';
    
    // 设置窗口标题
    document.querySelector('#folderModal .modal-header h3').textContent = '创建文件夹';
    
    // 聚焦输入框
    setTimeout(() => elements.folderNameInput.focus(), 100);
}

// 隐藏文件夹模态框
function hideFolderModal() {
    elements.folderModal.classList.remove('show');
}

// 创建文件夹
async function createFolder() {
    const name = elements.folderNameInput.value.trim();
    
    if (!name) {
        showNotification('请输入文件夹名称', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/folders.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                color: selectedFolderColor
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('文件夹创建成功');
            hideFolderModal();
            loadFolders();
        } else {
            showNotification(result.message || '创建失败', 'error');
        }
    } catch (error) {
        console.error('创建文件夹失败:', error);
        showNotification('创建文件夹失败', 'error');
    }
}

// 保存内容项目
async function saveItem() {
    const title = elements.itemTitle.value.trim();
    const content = elements.itemContent.value.trim();
    const folderId = elements.folderSelect.value || null;
    
    if (!content) {
        showNotification('请输入内容', 'warning');
        return;
    }
    
    try {
        const requestData = {
            title: title,
            content: content,
            folder_id: folderId
        };
        
        // 添加附件信息
        if (currentAttachment) {
            requestData.attachment = currentAttachment;
        }
        
        const response = await fetch(`${API_BASE}/items.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('内容保存成功');
            clearInput();
            loadItems();
            loadFolders(); // 更新文件夹计数
        } else {
            showNotification(result.message || '保存失败', 'error');
        }
    } catch (error) {
        console.error('保存内容失败:', error);
        showNotification('保存内容失败', 'error');
    }
}

// 清空输入
function clearInput() {
    elements.itemTitle.value = '';
    elements.itemContent.value = '';
    elements.folderSelect.value = '';
    elements.attachmentPreview.style.display = 'none';
    elements.attachmentPreview.innerHTML = '';
    currentAttachment = null;
}

// 编辑项目
function editItem(item) {
    editingItem = item;
    elements.editTitle.value = item.title || '';
    elements.editContent.value = item.content || '';
    
    // 处理附件预览
    editingAttachment = null;
    if (item.attachment_url) {
        editingAttachment = {
            file_id: item.attachment_id,
            file_name: item.attachment_name,
            file_type: item.attachment_type,
            file_url: item.attachment_url,
            file_size: item.file_size
        };
        renderAttachmentPreview(editingAttachment, elements.editAttachmentPreview);
    } else {
        elements.editAttachmentPreview.style.display = 'none';
    }
    
    elements.editModal.classList.add('show');
    elements.editTitle.focus();
}

// 显示编辑模态框
function showEditModal() {
    elements.editModal.classList.add('show');
}

// 隐藏编辑模态框
function hideEditModal() {
    elements.editModal.classList.remove('show');
    editingItem = null;
}

// 更新项目
async function updateItem() {
    if (!editingItem) return;
    
    const title = elements.editTitle.value.trim();
    const content = elements.editContent.value.trim();
    
    if (!content) {
        showNotification('请输入内容', 'warning');
        return;
    }
    
    try {
        const requestData = {
            id: editingItem.id,
            title: title,
            content: content
        };
        
        // 如果附件有变化，添加附件信息
        if (editingAttachment !== null || (editingItem.attachment_id && !editingAttachment)) {
            requestData.update_attachment = true;
            requestData.attachment = editingAttachment || null;
        }
        
        const response = await fetch(`${API_BASE}/items.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('内容更新成功');
            hideEditModal();
            loadItems();
        } else {
            showNotification(result.message || '更新失败', 'error');
        }
    } catch (error) {
        console.error('更新内容失败:', error);
        showNotification('更新内容失败', 'error');
    }
}

// 删除项目
async function deleteItem() {
    if (!editingItem) return;
    
    if (!confirm('确定要删除这条内容吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/items.php`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: editingItem.id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('内容删除成功');
            hideEditModal();
            loadItems();
            loadFolders(); // 更新文件夹计数
        } else {
            showNotification(result.message || '删除失败', 'error');
        }
    } catch (error) {
        console.error('删除内容失败:', error);
        showNotification('删除内容失败', 'error');
    }
}

// 复制到剪贴板
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('已复制到剪贴板');
    } catch (error) {
        console.error('复制失败:', error);
        showNotification('复制失败', 'error');
    }
}

// 搜索处理
function handleSearch() {
    const query = elements.searchInput.value.trim();
    
    if (query) {
        searchItems(query);
        // 在移动端，确保搜索后自动关闭文件夹选择模态框（如果打开的话）
        if (window.innerWidth <= 768) {
            hideSelectFolderModal();
        }
    } else {
        loadItems();
    }
}

// 搜索项目
async function searchItems(query) {
    try {
        const response = await fetch(`${API_BASE}/items.php?search=${encodeURIComponent(query)}`);
        const result = await response.json();

        // 检查API响应格式
        const items = result.success ? (result.data || []) : [];

        renderItems(items);
        updateItemCount(items.length);
        updateLastUpdateFromItems(items);
        elements.currentFolderTitle.textContent = `搜索结果: "${query}"`;
        
        // 在移动端，滚动到内容区域
        if (window.innerWidth <= 768) {
            document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('搜索失败:', error);
        showNotification('搜索失败', 'error');
    }
}

// 更新项目计数
function updateItemCount(count) {
    elements.itemCount.textContent = `${count} 条内容`;
}

// 根据内容项目更新最后更新时间
function updateLastUpdateFromItems(items) {
    if (items.length === 0) {
        elements.lastUpdate.textContent = '';
        return;
    }

    // 找到最新的内容项目
    const latestItem = items.reduce((latest, current) => {
        const currentTime = new Date(current.created_at || current.updated_at);
        const latestTime = new Date(latest.created_at || latest.updated_at);
        return currentTime > latestTime ? current : latest;
    });

    const lastUpdateTime = new Date(latestItem.updated_at || latestItem.created_at);
    elements.lastUpdate.textContent = `最后更新: ${formatDate(lastUpdateTime)}`;
}

// 更新最后更新时间（备用函数）
function updateLastUpdate() {
    const now = new Date();
    elements.lastUpdate.textContent = `最后更新: ${formatTime(now)}`;
}

// 显示通知
function showNotification(message, type = 'success') {
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

// 工具函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;

    // 如果超过一周，显示具体日期和时间
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTime(date) {
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 显示编辑文件夹选择界面
function showEditFolderList() {
    fetch(`${API_BASE}/folders.php`)
        .then(response => response.json())
        .then(result => {
            if (!result.success || !result.data || result.data.length === 0) {
                showNotification('没有可编辑的文件夹', 'warning');
                return;
            }
            
            // 获取文件夹列表
            const folders = result.data;
            
            // 打开编辑文件夹模态框
            elements.editFolderModal.classList.add('show');
            
            // 创建文件夹选择下拉框内容
            const selectHtml = `
                <div class="folder-dropdown">
                    <label>选择文件夹：</label>
                    <select id="folderSelector" class="folder-select">
                        ${folders.map(folder => `
                            <option value="${folder.id}" data-color="${folder.color}" data-name="${escapeHtml(folder.name)}"
                                ${currentFolder && currentFolder.id === folder.id ? 'selected' : ''}>
                                ${escapeHtml(folder.name)}
                            </option>
                        `).join('')}
                    </select>
                </div>
            `;
            
            // 更新模态框内容
            const modalBody = document.querySelector('#editFolderModal .modal-body');
            
            // 添加选择器到模态框顶部
            if (!document.getElementById('folderSelector')) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = selectHtml;
                modalBody.insertBefore(tempDiv.firstElementChild, modalBody.firstChild);
            } else {
                document.querySelector('.folder-dropdown').innerHTML = selectHtml;
            }
            
            // 设置默认选中的文件夹
            let selectedFolder;
            
            if (currentFolder && folders.some(f => f.id === currentFolder.id)) {
                // 如果当前有选中文件夹，默认编辑它
                selectedFolder = folders.find(f => f.id === currentFolder.id);
            } else {
                // 否则选择第一个文件夹
                selectedFolder = folders[0];
            }
            
            // 设置编辑表单的值
            editingFolder = selectedFolder;
            elements.editFolderNameInput.value = selectedFolder.name;
            
            // 设置当前颜色
            updateColorSelection(selectedFolder.color);
            
            // 添加文件夹选择器的变更事件
            document.getElementById('folderSelector').addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const folderId = this.value;
                const selectedFolder = folders.find(f => f.id == folderId);
                
                if (selectedFolder) {
                    editingFolder = selectedFolder;
                    elements.editFolderNameInput.value = selectedFolder.name;
                    updateColorSelection(selectedFolder.color);
                }
            });
            
            // 聚焦输入框
            setTimeout(() => elements.editFolderNameInput.focus(), 100);
        })
        .catch(error => {
            console.error('获取文件夹失败:', error);
            showNotification('获取文件夹失败', 'error');
        });
}

// 辅助函数：更新颜色选择
function updateColorSelection(color) {
    const colorOptions = document.querySelectorAll('#editColorOptions .color-option');
    colorOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === color) {
            option.classList.add('selected');
        }
    });
    selectedFolderColor = color;
}

function hideEditFolderModal() {
    elements.editFolderModal.classList.remove('show');
    editingFolder = null;
}

// 更新文件夹
async function updateFolder() {
    if (!editingFolder) return;
    
    const name = elements.editFolderNameInput.value.trim();
    if (!name) {
        showNotification('请输入文件夹名称', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/folders.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: editingFolder.id,
                name: name,
                color: selectedFolderColor
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            hideEditFolderModal();
            loadData();
            showNotification('文件夹更新成功');
        } else {
            showNotification(result.message || '更新失败', 'error');
        }
    } catch (error) {
        console.error('更新文件夹失败:', error);
        showNotification('更新文件夹失败', 'error');
    }
}

// 删除文件夹
async function deleteFolder() {
    if (!editingFolder) return;
    
    if (!confirm('确定要删除此文件夹吗？此操作将删除文件夹中的所有内容且无法恢复。')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/folders.php`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: editingFolder.id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            hideEditFolderModal();
            
            // 如果当前选中的是被删除的文件夹，则重置选择
            if (currentFolder && currentFolder.id === editingFolder.id) {
                currentFolder = null;
            }
            
            loadData();
            showNotification('文件夹删除成功');
        } else {
            showNotification(result.message || '删除失败', 'error');
        }
    } catch (error) {
        console.error('删除文件夹失败:', error);
        showNotification('删除文件夹失败', 'error');
    }
}

// 显示选择文件夹模态框（移动端）
function showSelectFolderModal() {
    fetch(`${API_BASE}/folders.php`)
        .then(response => response.json())
        .then(result => {
            if (!result.success || !result.data || result.data.length === 0) {
                showNotification('没有可选择的文件夹', 'warning');
                return;
            }
            
            const folders = result.data;
            
            // 渲染文件夹列表
            const html = `
                <div class="folder-select-item" onclick="selectFolderAndScroll(null);">
                    <i class="fas fa-home"></i>
                    <span>全部内容</span>
                </div>
                ${folders.map(folder => `
                    <div class="folder-select-item" onclick="selectFolderAndScroll(${JSON.stringify(folder).replace(/"/g, '&quot;')});">
                        <i class="fas fa-folder" style="color: ${folder.color}"></i>
                        <span>${escapeHtml(folder.name)}</span>
                        <div class="folder-item-count">${folder.item_count || 0} 条内容</div>
                    </div>
                `).join('')}
            `;
            
            elements.mobileFolderList.innerHTML = html;
            elements.selectFolderModal.classList.add('show');
        })
        .catch(error => {
            console.error('获取文件夹失败:', error);
            showNotification('获取文件夹失败', 'error');
        });
}

// 隐藏选择文件夹模态框
function hideSelectFolderModal() {
    elements.selectFolderModal.classList.remove('show');
}

// 选择文件夹并滚动（优化移动端体验）
function selectFolderAndScroll(folder) {
    selectFolder(folder);
    hideSelectFolderModal();
    
    // 移动端滚动到内容区域
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

// 拖拽上传事件
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (isAllowedFileType(file)) {
            handleUploadedFile(file);
        } else {
            showNotification('不支持的文件类型', 'error');
        }
    }
}

function handleEditDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (isAllowedFileType(file)) {
            handleEditUploadedFile(file);
        } else {
            showNotification('不支持的文件类型', 'error');
        }
    }
}

// 上传文件
function uploadFile(file) {
    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', file);
    
    // 显示上传中状态
    elements.attachmentPreview.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <i class="fas fa-spinner fa-spin"></i> 上传中...
        </div>
    `;
    elements.attachmentPreview.style.display = 'block';
    
    // 发送请求
    fetch(`${API_BASE}/uploads.php`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // 保存附件信息
            currentAttachment = result.data;
            // 显示附件预览
            renderAttachmentPreview(result.data, elements.attachmentPreview);
        } else {
            showNotification(result.message || '上传文件失败', 'error');
            elements.attachmentPreview.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('上传文件失败:', error);
        showNotification('上传文件失败', 'error');
        elements.attachmentPreview.style.display = 'none';
    });
}

// 上传编辑中的文件
function uploadEditFile(file) {
    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', file);
    
    // 显示上传中状态
    elements.editAttachmentPreview.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <i class="fas fa-spinner fa-spin"></i> 上传中...
        </div>
    `;
    elements.editAttachmentPreview.style.display = 'block';
    
    // 发送请求
    fetch(`${API_BASE}/uploads.php`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // 保存附件信息
            editingAttachment = result.data;
            // 显示附件预览
            renderAttachmentPreview(result.data, elements.editAttachmentPreview);
        } else {
            showNotification(result.message || '上传文件失败', 'error');
            elements.editAttachmentPreview.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('上传文件失败:', error);
        showNotification('上传文件失败', 'error');
        elements.editAttachmentPreview.style.display = 'none';
    });
}

// 上传Base64编码的图片
function uploadBase64Image(imageData, fileName) {
    try {
        fetch(`${API_BASE}/uploads.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_data: imageData,
                file_name: fileName
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // 保存附件信息
                currentAttachment = result.data;
                // 显示附件预览
                renderAttachmentPreview(result.data, elements.attachmentPreview);
            } else {
                showNotification(result.message || '上传图片失败', 'error');
            }
        })
        .catch(error => {
            console.error('上传图片失败:', error);
            showNotification('上传图片失败', 'error');
        });
    } catch (error) {
        console.error('上传图片失败:', error);
        showNotification('上传图片失败', 'error');
    }
}

// 处理文件上传
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    handleUploadedFile(file);
    
    // 重置文件输入框
    e.target.value = '';
}

// 处理编辑时的文件上传
function handleEditFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    handleEditUploadedFile(file);
    
    // 重置文件输入框
    e.target.value = '';
}
