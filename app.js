// © 2025 Bùi Đạt Hiếu - Bản quyền thuộc về tác giả. Mọi quyền được bảo lưu.

document.addEventListener("DOMContentLoaded", function() {
    const data = window.tuongTacData;
    const allDrugs = new Set();

    // Chỉ lấy thuốc/hoạt chất trong cac_thuoc_trong_nhom
    data.forEach(item => {
        if (item.cac_thuoc_trong_nhom) {
            const drugs = Array.isArray(item.cac_thuoc_trong_nhom)
                ? item.cac_thuoc_trong_nhom
                : [item.cac_thuoc_trong_nhom];
            drugs.forEach(d => {
                if (d) allDrugs.add(String(d));
            });
        }
    });

    const input = document.getElementById('search-input');
    const suggestions = document.getElementById('suggestions');
    const results = document.getElementById('results');

    // Autocomplete & chọn hoạt chất
    input.addEventListener('input', debounce(function(e) {
        const query = e.target.value.trim().toLowerCase();
        suggestions.innerHTML = '';
        if (!query) {
            suggestions.style.display = 'none';
            return;
        }

        const filtered = Array.from(allDrugs)
            .filter(d => typeof d === 'string')
            .filter(d => String(d).toLowerCase().includes(query));

        if (filtered.length > 0) {
            filtered.forEach(drug => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = drug;
                div.onclick = () => {
                    showDrugInfo(drug);
                    input.value = drug;
                    suggestions.style.display = 'none';
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

    // Xử lý Enter để chọn hoạt chất
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const value = input.value.trim();
            if (value) {
                const found = Array.from(allDrugs).find(d =>
                    String(d).toLowerCase() === value.toLowerCase()
                );
                if (found) {
                    showDrugInfo(found);
                } else {
                    results.innerHTML = `<div class="result-card">Không tìm thấy thông tin cho thuốc này.</div>`;
                }
            }
            suggestions.style.display = 'none';
        }
    });

    // Hiển thị thông tin chi tiết
    function showDrugInfo(drugName) {
        const item = data.find(item => {
            if (!item.cac_thuoc_trong_nhom) return false;
            const drugs = Array.isArray(item.cac_thuoc_trong_nhom)
                ? item.cac_thuoc_trong_nhom
                : [item.cac_thuoc_trong_nhom];
            return drugs.map(d => String(d).toLowerCase()).includes(drugName.toLowerCase());
        });
        if (!item) {
            results.innerHTML = `<div class="result-card">Không tìm thấy thông tin cho thuốc này.</div>`;
            return;
        }
        results.innerHTML = `
            <div class="result-card">
                <h3>${drugName}</h3>
                <p><b>Mô tả:</b> ${item.mo_ta || "Không có thông tin"}</p>
                <p><b>Các thuốc trong nhóm:</b> ${Array.isArray(item.cac_thuoc_trong_nhom) ? item.cac_thuoc_trong_nhom.join(", ") : item.cac_thuoc_trong_nhom}</p>
                <p><b>Chú ý khi chỉ định:</b><br>${formatChuY(item.chu_y_khi_chi_dinh)}</p>
                <p><b>Tương tác:</b><br>${formatTuongTac(item.tuong_tac)}</p>
            </div>
        `;
    }

    function formatChuY(obj) {
        if (!obj) return "Không có thông tin";
        return Object.entries(obj).map(([k, v]) => `<b>${k}:</b> ${v}`).join("<br>");
    }

    function formatTuongTac(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return "Không có thông tin";
        return arr.map(t => {
            const thuoc = Array.isArray(t.thuoc) ? t.thuoc.join(", ") : t.thuoc;
            return `<b>Với:</b> ${thuoc}<br><b>Mức độ:</b> ${t.muc_do}<br><b>Phân tích:</b> ${t.phan_tich}<br><b>Xử lý:</b> ${t.xu_ly}`;
        }).join("<hr>");
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
