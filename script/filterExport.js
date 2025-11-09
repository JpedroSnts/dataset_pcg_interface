// ========================================
// FUNCIONALIDADES DE FILTER E EXPORT
// ========================================

// Variáveis globais para filtros
let activeFilters = {
    countries: ['Brasil', 'China', 'India', 'Russia', 'AfricaDoSul'],
    yearStart: 2003,
    yearEnd: 2020
};

// ===== FILTER =====
function openFilterModal() {
    const modal = document.getElementById('filterModal');
    modal.classList.add('active');
    
    if (speechActive) {
        speak("Modal de filtros aberto");
    }
}

function closeFilterModal() {
    const modal = document.getElementById('filterModal');
    modal.classList.remove('active');
    
    if (speechActive) {
        speak("Modal de filtros fechado");
    }
}

function applyFilters() {
    // Pega os países selecionados
    const checkboxes = document.querySelectorAll('#filterModal input[type="checkbox"]');
    activeFilters.countries = [];
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            activeFilters.countries.push(checkbox.value);
        }
    });
    
    // Pega os anos
    activeFilters.yearStart = parseInt(document.getElementById('yearStart').value) || 2003;
    activeFilters.yearEnd = parseInt(document.getElementById('yearEnd').value) || 2020;
    
    // Valida os anos
    if (activeFilters.yearStart > activeFilters.yearEnd) {
        alert("O ano inicial não pode ser maior que o ano final!");
        return;
    }
    
    if (activeFilters.yearStart < 2003 || activeFilters.yearEnd > 2020) {
        alert("Os anos devem estar entre 2003 e 2020!");
        return;
    }
    
    // Fecha o modal
    closeFilterModal();
    
    // Atualiza o gráfico com os filtros
    updateChartWithFilters();
    
    console.log("Filtros aplicados:", activeFilters);
    
    if (speechActive) {
        speak(`Filtros aplicados. ${activeFilters.countries.length} países selecionados, de ${activeFilters.yearStart} até ${activeFilters.yearEnd}`);
    }
}

function updateChartWithFilters() {
    // Reconstrói o gráfico atual com os dados filtrados
    const activeButton = document.querySelector('.cardChart.active');
    
    if (!activeButton) return;
    
    // Simula um clique no botão ativo para recarregar o gráfico
    activeButton.click();
}

function getFilteredData() {
    // Filtra os países
    const filteredCountries = {};
    
    activeFilters.countries.forEach(countryKey => {
        if (data.countries[countryKey]) {
            filteredCountries[countryKey] = data.countries[countryKey];
        }
    });
    
    // Filtra os anos
    const startIndex = data.labelsData.indexOf(activeFilters.yearStart);
    const endIndex = data.labelsData.indexOf(activeFilters.yearEnd);
    
    if (startIndex === -1 || endIndex === -1) {
        return { countries: filteredCountries, labels: data.labelsData };
    }
    
    const filteredLabels = data.labelsData.slice(startIndex, endIndex + 1);
    
    // Filtra os dados dos países
    Object.keys(filteredCountries).forEach(key => {
        filteredCountries[key] = {
            ...filteredCountries[key],
            data: filteredCountries[key].data.slice(startIndex, endIndex + 1)
        };
    });
    
    return { countries: filteredCountries, labels: filteredLabels };
}

// ===== EXPORT =====
function exportData() {
    const exportOptions = [
        "1. Exportar como CSV",
        "2. Exportar como JSON",
        "3. Exportar imagem do gráfico (PNG)"
    ];
    
    const choice = prompt(
        "Escolha o formato de exportação:\n\n" + exportOptions.join("\n") + "\n\nDigite o número (1, 2 ou 3):"
    );
    
    switch(choice) {
        case "1":
            exportAsCSV();
            break;
        case "2":
            exportAsJSON();
            break;
        case "3":
            exportAsImage();
            break;
        default:
            if (choice !== null) {
                alert("Opção inválida!");
            }
    }
}

function exportAsCSV() {
    const filteredData = getFilteredData();
    
    // Cabeçalho
    let csv = "Ano," + Object.values(filteredData.countries).map(c => c.label).join(",") + "\n";
    
    // Dados
    filteredData.labels.forEach((year, index) => {
        let row = year;
        Object.values(filteredData.countries).forEach(country => {
            row += "," + (country.data[index] || "");
        });
        csv += row + "\n";
    });
    
    // Download
    downloadFile(csv, "investimentos_pd_brics.csv", "text/csv");
    
    console.log("Dados exportados como CSV");
    
    if (speechActive) {
        speak("Dados exportados como CSV");
    }
}

function exportAsJSON() {
    const filteredData = getFilteredData();
    
    const jsonData = {
        title: "Investimentos em P&D - BRICS",
        period: `${activeFilters.yearStart}-${activeFilters.yearEnd}`,
        countries: {}
    };
    
    filteredData.labels.forEach((year, index) => {
        jsonData.countries[year] = {};
        Object.entries(filteredData.countries).forEach(([key, country]) => {
            jsonData.countries[year][country.label] = country.data[index];
        });
    });
    
    const json = JSON.stringify(jsonData, null, 2);
    downloadFile(json, "investimentos_pd_brics.json", "application/json");
    
    console.log("Dados exportados como JSON");
    
    if (speechActive) {
        speak("Dados exportados como JSON");
    }
}

function exportAsImage() {
    if (!globalChart) {
        alert("Nenhum gráfico disponível para exportar!");
        return;
    }
    
    const canvas = document.getElementById('bricsChart');
    const url = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = 'grafico_investimentos_pd_brics.png';
    link.href = url;
    link.click();
    
    console.log("Gráfico exportado como PNG");
    
    if (speechActive) {
        speak("Gráfico exportado como imagem PNG");
    }
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    // Botão Filter
    const btnFilter = document.getElementById('btnFilter');
    if (btnFilter) {
        btnFilter.addEventListener('click', openFilterModal);
    }
    
    // Botão Export
    const btnExport = document.getElementById('btnExport');
    if (btnExport) {
        btnExport.addEventListener('click', exportData);
    }
    
    // Modal - Fechar ao clicar fora
    const modal = document.getElementById('filterModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeFilterModal();
            }
        });
    }
    
    // Botão Cancelar
    const btnCancel = document.getElementById('btnCancelFilter');
    if (btnCancel) {
        btnCancel.addEventListener('click', closeFilterModal);
    }
    
    // Botão Aplicar
    const btnApply = document.getElementById('btnApplyFilter');
    if (btnApply) {
        btnApply.addEventListener('click', applyFilters);
    }
    
    console.log("Sistema de filtros e exportação carregado");
});