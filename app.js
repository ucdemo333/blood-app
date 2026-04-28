// 血壓管理App - JavaScript

// 從 localStorage 載入記錄
function loadRecords() {
    const records = localStorage.getItem('bpRecords');
    return records ? JSON.parse(records) : [];
}

// 儲存記錄到 localStorage
function saveRecords(records) {
    localStorage.setItem('bpRecords', JSON.stringify(records));
}

// 格式化日期時間
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    return date.toLocaleString('zh-TW', options);
}

// 取得血壓分類
function getBPCategory(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) {
        return 'bp-normal';
    } else if (systolic >= 140 || diastolic >= 90) {
        return 'bp-high';
    } else {
        return 'bp-elevated';
    }
}

// 渲染記錄列表
function renderRecords() {
    const records = loadRecords();
    const recordsList = document.getElementById('recordsList');
    
    if (records.length === 0) {
        recordsList.innerHTML = '<p class="no-records">尚無記錄，請輸入血壓資料</p>';
        return;
    }

    // 按時間倒序排列
    const sortedRecords = [...records].sort((a, b) => 
        new Date(b.dateTime) - new Date(a.dateTime)
    );

    recordsList.innerHTML = sortedRecords.map((record, index) => {
        const category = getBPCategory(record.systolic, record.diastolic);
        return `
            <div class="record-card ${category}" data-index="${records.length - 1 - index}">
                <div class="record-header">
                    <span class="record-date">${formatDateTime(record.dateTime)}</span>
                    <button class="record-delete" onclick="deleteRecord(${records.length - 1 - index})" title="刪除">🗑️</button>
                </div>
                <div class="record-data">
                    <div class="data-item">
                        <span class="data-label">收縮壓</span>
                        <span class="data-value systolic">${record.systolic}</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">舒張壓</span>
                        <span class="data-value diastolic">${record.diastolic}</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">脈搏</span>
                        <span class="data-value pulse">${record.pulse}</span>
                    </div>
                </div>
                <div class="record-footer">
                    <span class="record-medication ${record.medication}">${record.medication}</span>
                    ${record.notes ? `<span class="record-notes">${escapeHtml(record.notes)}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// 防止 XSS 攻擊
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 新增記錄
function addRecord(record) {
    const records = loadRecords();
    records.push(record);
    saveRecords(records);
    renderRecords();
}

// 刪除單筆記錄
function deleteRecord(index) {
    const records = loadRecords();
    records.splice(index, 1);
    saveRecords(records);
    renderRecords();
}

// 清除全部記錄
function clearAllRecords() {
    if (confirm('確定要清除所有血壓記錄嗎？此操作無法復原。')) {
        saveRecords([]);
        renderRecords();
    }
}

// 表單提交處理
document.getElementById('bpForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const record = {
        systolic: parseInt(document.getElementById('systolic').value),
        diastolic: parseInt(document.getElementById('diastolic').value),
        pulse: parseInt(document.getElementById('pulse').value),
        medication: document.getElementById('medication').value,
        notes: document.getElementById('notes').value.trim(),
        dateTime: new Date().toISOString()
    };

    addRecord(record);

    // 重置表單
    this.reset();
    
    // 顯示成功訊息
    alert('記錄已儲存！');
});

// 清除全部按鈕
document.getElementById('clearAll').addEventListener('click', clearAllRecords);

// 頁面載入時渲染記錄
document.addEventListener('DOMContentLoaded', renderRecords);