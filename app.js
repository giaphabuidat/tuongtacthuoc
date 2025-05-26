// app.js
document.addEventListener("DOMContentLoaded", function() {
    const data = window.tuongTacData;
    const allDrugs = new Set();

    // Tạo danh sách tất cả hoạt chất và thuốc tương tác
    data.forEach(item => {
        allDrugs.add(item.hoat_chat);
        item.tuong_tac.forEach(t => allDrugs.add(t.thuoc));
    });

    const input = document.getElementById('search-input');
    const suggestions = document.getElementById('suggestions');
    const results = document.getElementById('results');

    // Xử lý autocomplete
    input.addEventListener('input', debounce(function(e) {
        const query = e.target.value.trim().toLowerCase();
        suggestions.innerHTML = '';
        results.innerHTML = '';

        if (!query) {
            suggestions.style.display = 'none';
            return;
        }

        const filtered = Array.from(allDrugs).filter(d =>
            d.toLowerCase().includes(query)
        );

        if (filtered.length > 0) {
            filtered.forEach(drug => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = drug;
                div.onclick = () => {
                    input.value = drug;
                    suggestions.style.display = 'none';
                    showResults(drug);
                };
                suggestions.appendChild(div);
            });
            suggestions.style.display = 'block';
        } else {
            suggestions.style.display = 'none';
        }
    }, 250));

    // Ẩn gợi ý khi click ngoài
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-container")) {
            suggestions.style.display = "none";
        }
    });

    // Xử lý Enter
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            showResults(input.value.trim());
            suggestions.style.display = 'none';
        }
    });

    // Hiển thị kết quả
    function showResults(searchTerm) {
        results.innerHTML = '';
        if (!searchTerm) return;

        let found = false;

        // Tìm hoạt chất trùng khớp
        const exactMatch = data.find(item =>
            item.hoat_chat.toLowerCase() === searchTerm.toLowerCase()
        );

        if (exactMatch) {
            found = true;
            exactMatch.tuong_tac.forEach(t => {
                results.appendChild(createResultCard(exactMatch.hoat_chat, t));
            });
        } else {
            // Tìm các tương tác có chứa thuốc
            data.forEach(item => {
                item.tuong_tac.forEach(t => {
                    if (t.thuoc.toLowerCase() === searchTerm.toLowerCase()) {
                        found = true;
                        results.appendChild(createResultCard(item.hoat_chat, t));
                    }
                });
            });
        }

        if (!found) {
            results.innerHTML = `<div class="result-card"><em>Không tìm thấy kết quả phù hợp.</em></div>`;
        }
    }

    // Tạo thẻ kết quả
    function createResultCard(hoatChat, interaction) {
        const card = document.createElement('div');
        card.className = 'result-card';

        const severityClass = `mucdo-${interaction.muc_do}`;

        card.innerHTML = `
            <h3>${hoatChat} ↔ ${interaction.thuoc}</h3>
            <div class="severity ${severityClass}">
                Mức độ ${interaction.muc_do}: ${getSeverityText(interaction.muc_do)}
            </div>
            <p><strong>Phân tích:</strong> ${interaction.phan_tich}</p>
            <p><strong>Xử lý:</strong> ${interaction.xu_ly}</p>
        `;

        return card;
    }

    function getSeverityText(mucdo) {
        const levels = {
            1: 'Theo dõi',
            2: 'Thận trọng',
            3: 'Cân nhắc',
            4: 'Nguy hiểm'
        };
        return levels[mucdo] || 'Không xác định';
    }

    // Hàm debounce
    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), timeout);
        };
    }
});
