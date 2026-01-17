// Edited By Song Zichen, Quan Hai Middle School
let currentQuestions = [];
let currentType = '';
let wrongAnswers = [];
let mathConfig = null;

document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    loadPoetryList();
    loadEnglishUnits();
    loadMathConfig();
});

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const tabId = this.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.style.display = 'none';
            });
            document.getElementById(tabId + '-tab').style.display = 'block';
        });
    });
}

async function loadPoetryList() {
    try {
        const response = await fetch('/api/poetry/list');
        const data = await response.json();
        
        const container = document.getElementById('poetry-list');
        if (data.length === 0) {
            container.innerHTML = '<p>暂无古诗数据，请在data/poetry.json中添加</p>';
            return;
        }
        
        container.innerHTML = data.map(poem => `
            <div class="checkbox-item">
                <input type="checkbox" id="poem-${poem.id}" value="${poem.name}">
                <label for="poem-${poem.id}">${poem.name} - ${poem.author}</label>
            </div>
        `).join('');
    } catch (error) {
        console.error('加载古诗列表失败:', error);
        document.getElementById('poetry-list').innerHTML = '<p>加载失败，请检查服务器</p>';
    }
}

async function loadEnglishUnits() {
    try {
        const response = await fetch('/api/english/units');
        const data = await response.json();
        
        const select = document.getElementById('english-unit');
        if (data.length === 0) {
            select.innerHTML = '<option value="">暂无单元数据</option>';
            return;
        }
        
        select.innerHTML = '<option value="">请选择单元</option>' + 
            data.map(unit => `<option value="${unit.name}">${unit.name}</option>`).join('');
    } catch (error) {
        console.error('加载英语单元失败:', error);
        document.getElementById('english-unit').innerHTML = '<option value="">加载失败</option>';
    }
}

async function loadMathConfig() {
    try {
        const response = await fetch('/api/math/config');
        const data = await response.json();
        mathConfig = data;
        
        const gradeSelect = document.getElementById('math-grade');
        gradeSelect.innerHTML = '<option value="">请选择年级</option>' + 
            data.grade_levels.map(grade => `<option value="${grade.id}">${grade.name}</option>`).join('');
    } catch (error) {
        console.error('加载数学配置失败:', error);
    }
}

function loadMathCategories() {
    const gradeId = document.getElementById('math-grade').value;
    const categorySelect = document.getElementById('math-category');
    
    if (!gradeId || !mathConfig) {
        categorySelect.innerHTML = '<option value="">请先选择年级</option>';
        return;
    }
    
    const grade = mathConfig.grade_levels.find(g => g.id === gradeId);
    if (!grade) return;
    
    categorySelect.innerHTML = '<option value="">请选择类别</option>' + 
        grade.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    
    document.getElementById('math-type').innerHTML = '<option value="">请先选择类别</option>';
}

function loadMathTypes() {
    const gradeId = document.getElementById('math-grade').value;
    const categoryId = document.getElementById('math-category').value;
    const typeSelect = document.getElementById('math-type');
    
    if (!gradeId || !categoryId || !mathConfig) {
        typeSelect.innerHTML = '<option value="">请先选择类别</option>';
        return;
    }
    
    const grade = mathConfig.grade_levels.find(g => g.id === gradeId);
    if (!grade) return;
    
    const category = grade.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    typeSelect.innerHTML = '<option value="">请选择题型</option>' + 
        category.types.map(type => `<option value="${type.id}">${type.name}</option>`).join('');
}

async function generateMath() {
    const gradeId = document.getElementById('math-grade').value;
    const categoryId = document.getElementById('math-category').value;
    const typeId = document.getElementById('math-type').value;
    const count = parseInt(document.getElementById('math-count').value);
    
    if (!gradeId || !categoryId || !typeId) {
        alert('请完整选择年级、类别和题型');
        return;
    }
    
    try {
        const response = await fetch('/api/generate/math', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grade_id: gradeId, category_id: categoryId, type_id: typeId, count })
        });
        
        const data = await response.json();
        currentQuestions = data.questions;
        currentType = 'math';
        displayQuestions();
    } catch (error) {
        console.error('生成数学题失败:', error);
        alert('生成题目失败，请重试');
    }
}

async function generatePoetry() {
    const checkboxes = document.querySelectorAll('#poetry-list input[type="checkbox"]:checked');
    const selectedPoems = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedPoems.length === 0) {
        alert('请至少选择一首古诗');
        return;
    }
    
    const count = parseInt(document.getElementById('poetry-count').value);
    
    try {
        const response = await fetch('/api/generate/poetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ poems: selectedPoems, count: count })
        });
        
        const data = await response.json();
        currentQuestions = data.questions;
        currentType = 'poetry';
        displayQuestions();
    } catch (error) {
        console.error('生成古诗题失败:', error);
        alert('生成题目失败，请重试');
    }
}

async function generateEnglish() {
    const unit = document.getElementById('english-unit').value;
    const direction = document.getElementById('english-direction').value;
    
    if (!unit) {
        alert('请选择单元');
        return;
    }
    
    try {
        const response = await fetch('/api/generate/english', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unit, direction })
        });
        
        const data = await response.json();
        currentQuestions = data.questions;
        currentType = 'english';
        displayQuestions();
    } catch (error) {
        console.error('生成英语题失败:', error);
        alert('生成题目失败，请重试');
    }
}

function displayQuestions() {
    const container = document.getElementById('questions-container');
    const section = document.getElementById('questions-section');
    
    if (currentQuestions.length === 0) {
        alert('没有生成题目');
        return;
    }
    
    container.innerHTML = currentQuestions.map((q, index) => {
        let questionText = q.question;
        
        if (questionText.includes('\\frac')) {
            questionText = questionText.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '<sup>$1</sup>&frasl;<sub>$2</sub>');
        }
        
        return `
        <div class="question-item" id="question-${index}">
            <div class="question-content-wrapper">
                <div class="question-label">${questionText}</div>
                <button class="ai-explain-btn-small" id="ai-explain-btn-${index}" onclick="askAIForSingleQuestion(${index})" style="display: none;">AI讲解</button>
            </div>
            <input type="text" class="question-input" id="answer-${index}" placeholder="请输入答案">
            <div class="answer-hint" id="hint-${index}" style="display: none;"></div>
            <div class="ai-explain-result" id="ai-explain-result-${index}" style="display: none;"></div>
        </div>
        `;
    }).join('');
    
    section.style.display = 'block';
    document.getElementById('result-section').style.display = 'none';
}

function checkAnswers() {
    let correct = 0;
    wrongAnswers = [];
    
    currentQuestions.forEach((q, index) => {
        const userAnswer = document.getElementById(`answer-${index}`).value.trim();
        const questionDiv = document.getElementById(`question-${index}`);
        const hintDiv = document.getElementById(`hint-${index}`);
        const aiExplainBtn = document.getElementById(`ai-explain-btn-${index}`);
        const aiExplainResult = document.getElementById(`ai-explain-result-${index}`);
        
        let isCorrect = false;
        if (currentType === 'math') {
            isCorrect = userAnswer === String(q.answer);
        } else {
            isCorrect = userAnswer === q.answer;
        }
        
        if (isCorrect) {
            correct++;
            questionDiv.classList.remove('incorrect');
            questionDiv.classList.add('correct');
            hintDiv.style.display = 'none';
            if (aiExplainBtn) aiExplainBtn.style.display = 'none';
            if (aiExplainResult) aiExplainResult.style.display = 'none';
        } else {
            questionDiv.classList.remove('correct');
            questionDiv.classList.add('incorrect');
            hintDiv.innerHTML = `正确答案: ${q.answer}`;
            hintDiv.style.display = 'block';
            if (aiExplainBtn) aiExplainBtn.style.display = 'inline-block';
            if (aiExplainResult) aiExplainResult.style.display = 'none';
            
            wrongAnswers.push({
                question: q.question,
                userAnswer: userAnswer,
                correctAnswer: q.answer,
                index: index
            });
        }
    });
    
    const resultSection = document.getElementById('result-section');
    const resultText = document.getElementById('result-text');
    const percentage = Math.round((correct / currentQuestions.length) * 100);
    
    resultText.innerHTML = `
        共 ${currentQuestions.length} 题，答对 ${correct} 题，答错 ${currentQuestions.length - correct} 题<br>
        正确率: ${percentage}%
    `;
    resultSection.style.display = 'block';
    
    const aiExplainBtn = document.getElementById('ai-explain-btn');
    if (wrongAnswers.length > 0) {
        aiExplainBtn.style.display = 'inline-block';
    } else {
        aiExplainBtn.style.display = 'none';
    }
}

function resetQuestions() {
    currentQuestions = [];
    currentType = '';
    document.getElementById('questions-container').innerHTML = '';
    document.getElementById('questions-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'none';
}

async function downloadReport() {
    if (currentQuestions.length === 0) {
        alert('没有可下载的练习报告');
        return;
    }
    
    const answers = currentQuestions.map((q, index) => {
        const userAnswer = document.getElementById(`answer-${index}`).value.trim();
        return {
            question: q.question,
            user_answer: userAnswer,
            correct_answer: q.answer,
            is_correct: userAnswer === q.answer
        };
    });
    
    try {
        const response = await fetch('/api/download/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: currentType,
                answers: answers
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '练习报告.docx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    const model = document.getElementById('ai-model').value;
    
    if (!message) {
        alert('请输入问题');
        return;
    }
    
    const chatMessages = document.getElementById('chat-messages');
    
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.innerHTML = `<div class="message-content"><p>${escapeHtml(message)}</p></div>`;
    chatMessages.appendChild(userMessage);
    
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'chat-message ai-message';
    loadingMessage.id = 'loading-message';
    loadingMessage.innerHTML = `<div class="message-content"><p>正在思考...</p></div>`;
    chatMessages.appendChild(loadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: message, model })
        });
        
        const data = await response.json();
        
        chatMessages.removeChild(loadingMessage);
        
        if (response.ok) {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'chat-message ai-message';
            aiMessage.innerHTML = `<div class="message-content"><p>${escapeHtml(data.answer)}</p></div>`;
            chatMessages.appendChild(aiMessage);
        } else {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'chat-message ai-message';
            errorMessage.innerHTML = `<div class="message-content"><p style="color: red;">错误: ${escapeHtml(data.error || '未知错误')}</p></div>`;
            chatMessages.appendChild(errorMessage);
        }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        chatMessages.removeChild(loadingMessage);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'chat-message ai-message';
        errorMessage.innerHTML = `<div class="message-content"><p style="color: red;">错误: ${escapeHtml(error.message)}</p></div>`;
        chatMessages.appendChild(errorMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function clearChat() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = `
        <div class="chat-message system-message">
            <div class="message-content">
                <p>欢迎使用AI智能问答！</p>
                <p>您可以问我任何问题，我会尽力回答。</p>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.getElementById('chat-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function downloadMath() {
    const gradeId = document.getElementById('math-grade').value;
    const categoryId = document.getElementById('math-category').value;
    const typeId = document.getElementById('math-type').value;
    const count = parseInt(document.getElementById('math-count').value);
    
    if (!gradeId || !categoryId || !typeId) {
        alert('请完整选择年级、类别和题型');
        return;
    }
    
    try {
        const response = await fetch('/api/download/math', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grade_id: gradeId, category_id: categoryId, type_id: typeId, count })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '数学练习题.docx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
    }
}

async function downloadPoetry() {
    const checkboxes = document.querySelectorAll('#poetry-list input[type="checkbox"]:checked');
    const selectedPoems = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedPoems.length === 0) {
        alert('请至少选择一首古诗');
        return;
    }
    
    const count = parseInt(document.getElementById('poetry-count').value);
    
    try {
        const response = await fetch('/api/download/poetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ poems: selectedPoems, count: count })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '古诗默写练习.docx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
    }
}

async function downloadEnglish() {
    const unit = document.getElementById('english-unit').value;
    const direction = document.getElementById('english-direction').value;
    
    if (!unit) {
        alert('请选择单元');
        return;
    }
    
    try {
        const response = await fetch('/api/download/english', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unit, direction })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '英语默写练习.docx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
    }
}

async function askAIForSingleQuestion(index) {
    const aiExplainBtn = document.getElementById(`ai-explain-btn-${index}`);
    const aiExplainResult = document.getElementById(`ai-explain-result-${index}`);
    
    if (!aiExplainBtn || !aiExplainResult) return;
    
    const question = currentQuestions[index];
    const userAnswer = document.getElementById(`answer-${index}`).value.trim();
    
    aiExplainBtn.disabled = true;
    aiExplainBtn.textContent = '讲解中...';
    aiExplainResult.style.display = 'block';
    aiExplainResult.innerHTML = '<div class="ai-explain-loading-small">正在思考...</div>';
    
    try {
        const response = await fetch('/api/ai/explain/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.answer,
                type: currentType
            })
        });
        
        if (response.ok) {
            aiExplainResult.innerHTML = '';
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;
                        
                        try {
                            const json = JSON.parse(data);
                            if (json.content) {
                                aiExplainResult.innerHTML += escapeHtml(json.content);
                                aiExplainResult.scrollTop = aiExplainResult.scrollHeight;
                            }
                        } catch (e) {
                            console.error('解析流数据失败:', e);
                        }
                    }
                }
            }
        } else {
            const data = await response.json();
            aiExplainResult.innerHTML = `<p style="color: red;">错误：${escapeHtml(data.error || '请求失败')}</p>`;
        }
    } catch (error) {
        aiExplainResult.innerHTML = `<p style="color: red;">错误：${escapeHtml(error.message)}</p>`;
    } finally {
        aiExplainBtn.disabled = false;
        aiExplainBtn.textContent = 'AI讲解';
    }
}

async function askAIForWrongAnswers() {
    if (wrongAnswers.length === 0) {
        alert('没有错题需要讲解');
        return;
    }
    
    const modal = document.getElementById('ai-explain-modal');
    const messagesContainer = document.getElementById('ai-explain-messages');
    const loadingDiv = document.getElementById('ai-explain-loading');
    
    modal.style.display = 'block';
    messagesContainer.innerHTML = '';
    loadingDiv.style.display = 'block';
    
    const subjectName = currentType === 'math' ? '数学' : (currentType === 'poetry' ? '古诗' : '英语');
    
    let prompt = `请帮我讲解以下${subjectName}错题，每道题给出详细的解题思路和正确答案：\n\n`;
    
    wrongAnswers.forEach((wrong, index) => {
        prompt += `题目${index + 1}：${wrong.question}\n`;
        prompt += `我的答案：${wrong.userAnswer || '未作答'}\n`;
        prompt += `正确答案：${wrong.correctAnswer}\n\n`;
    });
    
    prompt += `请针对每道错题给出详细的讲解，包括解题思路、知识点分析和正确答案的推导过程。`;
    
    try {
        const response = await fetch('/api/ai/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questions: wrongAnswers,
                type: currentType,
                prompt: prompt
            })
        });
        
        loadingDiv.style.display = 'none';
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.explanations && data.explanations.length > 0) {
                data.explanations.forEach((explanation, index) => {
                    const explainItem = document.createElement('div');
                    explainItem.className = 'ai-explain-item';
                    
                    const wrong = wrongAnswers[index];
                    explainItem.innerHTML = `
                        <h4>题目${index + 1}：${escapeHtml(wrong.question)}</h4>
                        <p><strong>你的答案：</strong>${escapeHtml(wrong.userAnswer || '未作答')}</p>
                        <p><strong>正确答案：</strong>${escapeHtml(wrong.correctAnswer)}</p>
                        <p><strong>AI讲解：</strong></p>
                        <p>${escapeHtml(explanation)}</p>
                    `;
                    
                    messagesContainer.appendChild(explainItem);
                });
            } else {
                const errorItem = document.createElement('div');
                errorItem.className = 'ai-explain-item';
                errorItem.innerHTML = `<p style="color: red;">${escapeHtml(data.error || '未能获取讲解内容')}</p>`;
                messagesContainer.appendChild(errorItem);
            }
        } else {
            const data = await response.json();
            const errorItem = document.createElement('div');
            errorItem.className = 'ai-explain-item';
            errorItem.innerHTML = `<p style="color: red;">错误：${escapeHtml(data.error || '请求失败')}</p>`;
            messagesContainer.appendChild(errorItem);
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        const errorItem = document.createElement('div');
        errorItem.className = 'ai-explain-item';
        errorItem.innerHTML = `<p style="color: red;">错误：${escapeHtml(error.message)}</p>`;
        messagesContainer.appendChild(errorItem);
    }
}

function closeAIExplainModal() {
    const modal = document.getElementById('ai-explain-modal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('ai-explain-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}