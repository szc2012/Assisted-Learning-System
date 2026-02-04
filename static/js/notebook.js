// Edited By Song Zichen, Quan Hai Middle School
// 错题本 JavaScript

// 全局变量
let currentErrorId = null;
let selectedFiles = {
    question: [],
    answer: [],
    video: []
};
let existingFiles = {
    question: [],
    answer: [],
    video: []
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSubjects();
    loadStats();
    loadErrors();
    initForm();
    initDragDrop();
});

// 初始化表单
function initForm() {
    const form = document.getElementById('error-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveError();
    });
}

// 初始化拖拽上传
function initDragDrop() {
    const uploadAreas = document.querySelectorAll('.file-upload-area');
    uploadAreas.forEach(area => {
        area.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        area.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            const input = this.querySelector('input[type="file"]');
            if (input && e.dataTransfer.files.length > 0) {
                input.files = e.dataTransfer.files;
                const type = input.id.replace('-files', '');
                handleFileSelect(input, type);
            }
        });
    });
}

// 加载科目列表
async function loadSubjects() {
    try {
        const response = await fetch('/api/notebook/subjects');
        const data = await response.json();
        
        const filterSelect = document.getElementById('subject-filter');
        filterSelect.innerHTML = '<option value="">全部科目</option>';
        
        data.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            filterSelect.appendChild(option);
        });
    } catch (error) {
        console.error('加载科目列表失败:', error);
    }
}

// 加载统计信息
async function loadStats() {
    try {
        const response = await fetch('/api/notebook/stats');
        const data = await response.json();
        
        document.getElementById('total-errors').textContent = data.total_errors;
        document.getElementById('total-files').textContent = data.total_files;
    } catch (error) {
        console.error('加载统计信息失败:', error);
    }
}

// 加载错题列表
async function loadErrors() {
    const container = document.getElementById('errors-container');
    container.innerHTML = '<div class="loading">加载中...</div>';
    
    try {
        const subject = document.getElementById('subject-filter').value;
        let url = '/api/notebook/list';
        if (subject) {
            url += `?subject=${encodeURIComponent(subject)}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.errors.length === 0) {
            container.innerHTML = '<div class="empty-message">暂无错题，点击右上角"添加错题"开始记录吧！</div>';
            return;
        }
        
        container.innerHTML = data.errors.map(error => createErrorCard(error)).join('');
    } catch (error) {
        console.error('加载错题列表失败:', error);
        container.innerHTML = '<div class="empty-message">加载失败，请刷新重试</div>';
    }
}

// 创建错题卡片HTML
function createErrorCard(error) {
    const questionFilesCount = error.question_files?.length || 0;
    const answerFilesCount = error.answer_files?.length || 0;
    const videoFilesCount = error.video_files?.length || 0;
    
    const preview = error.question_text || '(无文字描述)';
    const dateStr = error.created_at ? error.created_at.split(' ')[0] : '';
    
    return `
        <div class="error-card">
            <div class="error-card-header">
                <span class="error-card-subject">${escapeHtml(error.subject)}</span>
                <span class="error-card-date">${dateStr}</span>
            </div>
            <div class="error-card-body">
                <div class="error-card-title">${escapeHtml(error.title)}</div>
                <div class="error-card-preview">${escapeHtml(preview)}</div>
                <div class="error-card-files">
                    ${questionFilesCount > 0 ? `<span class="file-badge">题目文件 ${questionFilesCount}</span>` : ''}
                    ${answerFilesCount > 0 ? `<span class="file-badge">答案文件 ${answerFilesCount}</span>` : ''}
                    ${videoFilesCount > 0 ? `<span class="file-badge has-video">视频 ${videoFilesCount}</span>` : ''}
                </div>
                <div class="error-card-actions">
                    <button class="btn btn-info" onclick="viewError('${error.id}')">查看</button>
                    <button class="btn btn-primary" onclick="editError('${error.id}')">编辑</button>
                    <button class="btn btn-danger" onclick="confirmDelete('${error.id}')">删除</button>
                </div>
            </div>
        </div>
    `;
}

// 搜索错题
async function searchErrors() {
    const keyword = document.getElementById('search-input').value.trim();
    const subject = document.getElementById('subject-filter').value;
    
    const container = document.getElementById('errors-container');
    container.innerHTML = '<div class="loading">搜索中...</div>';
    
    try {
        let url = '/api/notebook/search?';
        if (keyword) url += `keyword=${encodeURIComponent(keyword)}&`;
        if (subject) url += `subject=${encodeURIComponent(subject)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.errors.length === 0) {
            container.innerHTML = '<div class="empty-message">未找到匹配的错题</div>';
            return;
        }
        
        container.innerHTML = data.errors.map(error => createErrorCard(error)).join('');
    } catch (error) {
        console.error('搜索失败:', error);
        container.innerHTML = '<div class="empty-message">搜索失败，请重试</div>';
    }
}

// 处理搜索回车
function handleSearchKeyup(event) {
    if (event.key === 'Enter') {
        searchErrors();
    }
}

// 显示添加错题弹窗
function showAddModal() {
    currentErrorId = null;
    document.getElementById('modal-title').textContent = '添加错题';
    document.getElementById('error-form').reset();
    document.getElementById('error-id').value = '';
    
    // 清空文件预览
    selectedFiles = { question: [], answer: [], video: [] };
    existingFiles = { question: [], answer: [], video: [] };
    document.getElementById('question-preview').innerHTML = '';
    document.getElementById('answer-preview').innerHTML = '';
    document.getElementById('video-preview').innerHTML = '';
    
    document.getElementById('error-modal').style.display = 'block';
}

// 编辑错题
async function editError(errorId) {
    try {
        const response = await fetch(`/api/notebook/get/${errorId}`);
        const data = await response.json();
        
        if (data.error && typeof data.error === 'object') {
            const error = data.error;
            currentErrorId = errorId;
            
            document.getElementById('modal-title').textContent = '编辑错题';
            document.getElementById('error-id').value = errorId;
            document.getElementById('error-title').value = error.title || '';
            document.getElementById('error-subject').value = error.subject || '其他';
            document.getElementById('question-text').value = error.question_text || '';
            document.getElementById('answer-text').value = error.answer_text || '';
            document.getElementById('error-notes').value = error.notes || '';
            
            // 清空新选择的文件
            selectedFiles = { question: [], answer: [], video: [] };
            
            // 显示已有文件
            existingFiles = {
                question: error.question_files || [],
                answer: error.answer_files || [],
                video: error.video_files || []
            };
            
            renderExistingFiles('question');
            renderExistingFiles('answer');
            renderExistingFiles('video');
            
            document.getElementById('error-modal').style.display = 'block';
        } else {
            alert('错题不存在');
        }
    } catch (error) {
        console.error('获取错题详情失败:', error);
        alert('获取错题详情失败');
    }
}

// 渲染已有文件
function renderExistingFiles(type) {
    const previewContainer = document.getElementById(`${type}-preview`);
    const files = existingFiles[type];
    
    let html = '';
    
    if (files.length > 0) {
        html += '<div class="existing-files"><strong>已有文件：</strong>';
        files.forEach((file, index) => {
            html += `
                <span class="existing-file-item">
                    <span class="file-name">${escapeHtml(file.original_name)}</span>
                    <button type="button" class="delete-existing" onclick="deleteExistingFile('${type}', ${index}, '${file.filename}')">删除</button>
                </span>
            `;
        });
        html += '</div>';
    }
    
    previewContainer.innerHTML = html;
}

// 删除已有文件
async function deleteExistingFile(type, index, filename) {
    if (!currentErrorId) return;
    
    if (!confirm('确定要删除这个文件吗？')) return;
    
    try {
        const response = await fetch('/api/notebook/delete-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error_id: currentErrorId,
                file_type: type,
                filename: filename
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            existingFiles[type].splice(index, 1);
            renderExistingFiles(type);
        } else {
            alert(data.error || '删除失败');
        }
    } catch (error) {
        console.error('删除文件失败:', error);
        alert('删除文件失败');
    }
}

// 处理文件选择
function handleFileSelect(input, type) {
    const files = Array.from(input.files);
    selectedFiles[type] = files;
    renderFilePreview(type);
}

// 渲染文件预览
function renderFilePreview(type) {
    const previewContainer = document.getElementById(`${type}-preview`);
    const files = selectedFiles[type];
    
    // 保留已有文件的HTML
    let existingHtml = '';
    if (existingFiles[type].length > 0) {
        existingHtml = '<div class="existing-files"><strong>已有文件：</strong>';
        existingFiles[type].forEach((file, index) => {
            existingHtml += `
                <span class="existing-file-item">
                    <span class="file-name">${escapeHtml(file.original_name)}</span>
                    <button type="button" class="delete-existing" onclick="deleteExistingFile('${type}', ${index}, '${file.filename}')">删除</button>
                </span>
            `;
        });
        existingHtml += '</div>';
    }
    
    // 新选择的文件
    let newHtml = '';
    if (files.length > 0) {
        newHtml = '<div style="margin-top: 10px;"><strong>新添加：</strong></div>';
        files.forEach((file, index) => {
            const fileType = getFileTypeFromName(file.name);
            const iconText = getIconText(fileType);
            
            newHtml += `
                <div class="preview-item">
                    <span class="file-icon ${fileType}">${iconText}</span>
                    <span class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
                    <button type="button" class="remove-file" onclick="removeFile('${type}', ${index})">×</button>
                </div>
            `;
        });
    }
    
    previewContainer.innerHTML = existingHtml + newHtml;
}

// 移除新选择的文件
function removeFile(type, index) {
    selectedFiles[type].splice(index, 1);
    
    // 更新input的files（需要创建新的FileList）
    const input = document.getElementById(`${type}-files`);
    const dt = new DataTransfer();
    selectedFiles[type].forEach(file => dt.items.add(file));
    input.files = dt.files;
    
    renderFilePreview(type);
}

// 获取文件类型
function getFileTypeFromName(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['txt', 'md'].includes(ext)) return 'text';
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return 'video';
    return 'file';
}

// 获取图标文字
function getIconText(type) {
    const icons = {
        image: 'IMG',
        pdf: 'PDF',
        word: 'DOC',
        text: 'TXT',
        video: 'VID',
        file: 'FILE'
    };
    return icons[type] || 'FILE';
}

// 保存错题
async function saveError() {
    const title = document.getElementById('error-title').value.trim();
    const subject = document.getElementById('error-subject').value;
    const questionText = document.getElementById('question-text').value.trim();
    const answerText = document.getElementById('answer-text').value.trim();
    const notes = document.getElementById('error-notes').value.trim();
    
    if (!title) {
        alert('请输入错题标题');
        return;
    }
    
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '保存中...';
    
    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subject', subject);
        formData.append('question_text', questionText);
        formData.append('answer_text', answerText);
        formData.append('notes', notes);
        
        // 添加新选择的文件
        selectedFiles.question.forEach(file => {
            formData.append('question_files', file);
        });
        selectedFiles.answer.forEach(file => {
            formData.append('answer_files', file);
        });
        selectedFiles.video.forEach(file => {
            formData.append('video_files', file);
        });
        
        const url = currentErrorId 
            ? `/api/notebook/update/${currentErrorId}`
            : '/api/notebook/add';
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal();
            loadErrors();
            loadStats();
            loadSubjects();
            alert(currentErrorId ? '错题更新成功' : '错题添加成功');
        } else {
            alert(data.error || '保存失败');
        }
    } catch (error) {
        console.error('保存错题失败:', error);
        alert('保存错题失败');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '保存';
    }
}

// 关闭添加/编辑弹窗
function closeModal() {
    document.getElementById('error-modal').style.display = 'none';
    currentErrorId = null;
}

// 查看错题详情
async function viewError(errorId) {
    try {
        const response = await fetch(`/api/notebook/get/${errorId}`);
        const data = await response.json();
        
        if (data.error && typeof data.error === 'object') {
            const error = data.error;
            
            document.getElementById('view-title').textContent = error.title;
            
            let html = '';
            
            // 基本信息
            html += `
                <div class="detail-section">
                    <p><strong>科目：</strong>${escapeHtml(error.subject)}</p>
                    <p><strong>创建时间：</strong>${error.created_at}</p>
                    ${error.updated_at !== error.created_at ? `<p><strong>更新时间：</strong>${error.updated_at}</p>` : ''}
                </div>
            `;
            
            // 错题内容
            if (error.question_text) {
                html += `
                    <div class="detail-section">
                        <h4>错题内容</h4>
                        <div class="detail-content">${escapeHtml(error.question_text)}</div>
                    </div>
                `;
            }
            
            // 错题文件
            if (error.question_files && error.question_files.length > 0) {
                html += `
                    <div class="detail-section">
                        <h4>错题文件</h4>
                        <div class="detail-files">
                            ${renderDetailFiles(error.question_files, 'questions')}
                        </div>
                    </div>
                `;
            }
            
            // 答案内容
            if (error.answer_text) {
                html += `
                    <div class="detail-section">
                        <h4>答案内容</h4>
                        <div class="detail-content">${escapeHtml(error.answer_text)}</div>
                    </div>
                `;
            }
            
            // 答案文件
            if (error.answer_files && error.answer_files.length > 0) {
                html += `
                    <div class="detail-section">
                        <h4>答案文件</h4>
                        <div class="detail-files">
                            ${renderDetailFiles(error.answer_files, 'answers')}
                        </div>
                    </div>
                `;
            }
            
            // 讲解视频
            if (error.video_files && error.video_files.length > 0) {
                html += `
                    <div class="detail-section">
                        <h4>讲解视频</h4>
                        <div class="detail-files">
                            ${renderDetailVideos(error.video_files)}
                        </div>
                    </div>
                `;
            }
            
            // 笔记
            if (error.notes) {
                html += `
                    <div class="detail-section">
                        <h4>笔记/备注</h4>
                        <div class="detail-content">${escapeHtml(error.notes)}</div>
                    </div>
                `;
            }
            
            document.getElementById('view-content').innerHTML = html;
            document.getElementById('view-modal').style.display = 'block';
        } else {
            alert('错题不存在');
        }
    } catch (error) {
        console.error('获取错题详情失败:', error);
        alert('获取错题详情失败');
    }
}

// 渲染详情页文件
function renderDetailFiles(files, folder) {
    return files.map(file => {
        const url = `/uploads/${folder}/${file.filename}`;
        
        if (file.type === 'image') {
            return `
                <div class="detail-file-item" onclick="viewImage('${url}')">
                    <img src="${url}" alt="${escapeHtml(file.original_name)}">
                    <div class="file-info">
                        <div class="file-name">${escapeHtml(file.original_name)}</div>
                    </div>
                </div>
            `;
        } else {
            return `
                <a href="${url}" target="_blank" class="detail-file-item">
                    <div class="file-icon ${file.type}" style="width:60px;height:60px;font-size:20px;">
                        ${getIconText(file.type)}
                    </div>
                    <div class="file-info">
                        <div class="file-name">${escapeHtml(file.original_name)}</div>
                        <div>点击下载/查看</div>
                    </div>
                </a>
            `;
        }
    }).join('');
}

// 渲染详情页视频
function renderDetailVideos(files) {
    return files.map(file => {
        const url = `/uploads/videos/${file.filename}`;
        return `
            <div class="detail-file-item" style="max-width: 400px;">
                <video controls style="width: 100%; max-height: 300px;">
                    <source src="${url}" type="video/${file.filename.split('.').pop()}">
                    您的浏览器不支持视频播放
                </video>
                <div class="file-info">
                    <div class="file-name">${escapeHtml(file.original_name)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// 查看大图
function viewImage(url) {
    const viewer = document.createElement('div');
    viewer.className = 'image-viewer';
    viewer.innerHTML = `
        <span class="close-viewer" onclick="this.parentElement.remove()">&times;</span>
        <img src="${url}" alt="预览图片">
    `;
    viewer.onclick = function(e) {
        if (e.target === viewer) {
            viewer.remove();
        }
    };
    document.body.appendChild(viewer);
}

// 关闭查看弹窗
function closeViewModal() {
    document.getElementById('view-modal').style.display = 'none';
}

// 确认删除
function confirmDelete(errorId) {
    currentErrorId = errorId;
    document.getElementById('confirm-modal').style.display = 'block';
    document.getElementById('confirm-delete-btn').onclick = function() {
        deleteError(errorId);
    };
}

// 删除错题
async function deleteError(errorId) {
    try {
        const response = await fetch(`/api/notebook/delete/${errorId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeConfirmModal();
            loadErrors();
            loadStats();
            loadSubjects();
            alert('删除成功');
        } else {
            alert(data.error || '删除失败');
        }
    } catch (error) {
        console.error('删除错题失败:', error);
        alert('删除错题失败');
    }
}

// 关闭确认弹窗
function closeConfirmModal() {
    document.getElementById('confirm-modal').style.display = 'none';
    currentErrorId = null;
}

// HTML转义
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 点击弹窗外部关闭
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};
