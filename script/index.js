let globalChart = null;
const ctx = document.getElementById("bricsChart").getContext("2d");

function chartDestroy() {
    if (globalChart) {
        globalChart.destroy();
    }
}

// Função auxiliar para obter dados filtrados
function getFilteredChartData() {
    return getFilteredData();
}

function chartEvolucao(event, withMedia = false) {
    chartDestroy();

    const filteredData = getFilteredChartData();

    const datasetList = Object.entries(filteredData.countries).map(([key, value]) => {
        return {
            label: value.label,
            data: value.data,
            borderColor: value.color,
            backgroundColor: value.color,
            tension: 0,
            fill: false,
        };
    });

    if (withMedia) {
        const avgData = [];

        for (let i = 0; i < filteredData.labels.length; i++) {
            let sum = 0;
            for (const countryKey in filteredData.countries) {
                sum += filteredData.countries[countryKey].data[i];
            }
            avgData.push(sum / Object.keys(filteredData.countries).length);
        }

        datasetList.push({
            label: "Média BRICS",
            data: avgData,
            borderColor: "#990F02",
            backgroundColor: "#990F02",
            tension: 0,
            fill: false,
        });
    }

    const dados = {
        labels: filteredData.labels,
        datasets: datasetList,
    };

    const config = {
        type: "line",
        data: dados,
        options: {
            responsive: true,
            interaction: {
                mode: "index",
                intersect: false,
            },
            plugins: {
                title: chartOptions.getTitle(
                    `Evolução dos Investimentos em P&D (% do PIB) - BRICS (${filteredData.labels[0]}-${filteredData.labels[filteredData.labels.length - 1]})`
                ),
                legend: chartOptions.getLegend(),
            },
            scales: chartOptions.getScales(
                "Ano",
                "Investimento (% do PIB)",
                0.5,
                2.5
            ),
        },
    };

    globalChart = new Chart(ctx, config);
}

function chartRanking(event) {
    chartDestroy();

    const filteredData = getFilteredChartData();

    function obterRankingPais(paisNome) {
        const paises = Object.keys(filteredData.countries);
        if (!paises.includes(paisNome)) {
            throw new Error(`País "${paisNome}" não encontrado.`);
        }

        const anos = filteredData.labels;
        const resultado = [];

        anos.forEach((_, index) => {
            const valoresAno = paises.map((pais) => ({
                pais,
                valor: filteredData.countries[pais].data[index],
            }));

            valoresAno.sort((a, b) => b.valor - a.valor);
            const posicao =
                valoresAno.findIndex((item) => item.pais === paisNome) + 1;
            resultado.push(posicao);
        });

        return resultado;
    }

    const dados = {
        labels: filteredData.labels,
        datasets: Object.entries(filteredData.countries).map(([key, value]) => {
            return {
                label: value.label,
                data: obterRankingPais(key),
                borderColor: value.color,
                backgroundColor: value.color,
                tension: 0,
                fill: false,
            };
        }),
    };

    const maxRank = Object.keys(filteredData.countries).length + 1;

    const config = {
        type: "line",
        data: dados,
        options: {
            responsive: true,
            interaction: {
                mode: "index",
                intersect: false,
            },
            plugins: {
                title: chartOptions.getTitle(
                    `Ranking em Investimentos em P&D entre os BRICS (${filteredData.labels[0]}-${filteredData.labels[filteredData.labels.length - 1]})`
                ),
                legend: chartOptions.getLegend(),
            },
            scales: chartOptions.getScales(
                "Ano",
                "Posição no Ranking",
                0,
                maxRank,
                1,
                true
            ),
        },
    };

    globalChart = new Chart(ctx, config);
}

function chartComparacao(event) {
    chartEvolucao(event, true);
}

function chartHistograma(event) {
    chartDestroy();

    const filteredData = getFilteredChartData();

    // Combina todos os dados em um array único
    const allData = [];
    Object.values(filteredData.countries).forEach(country => {
        allData.push(...country.data);
    });

    // Cria bins para o histograma
    const min = Math.min(...allData);
    const max = Math.max(...allData);
    const binCount = 10;
    const binSize = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    const binLabels = [];

    for (let i = 0; i < binCount; i++) {
        const binStart = min + (i * binSize);
        const binEnd = binStart + binSize;
        binLabels.push(`${binStart.toFixed(2)}-${binEnd.toFixed(2)}`);

        allData.forEach(value => {
            if (value >= binStart && (i === binCount - 1 ? value <= binEnd : value < binEnd)) {
                bins[i]++;
            }
        });
    }

    const dados = {
        labels: binLabels,
        datasets: [{
            label: 'Frequência',
            data: bins,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: dados,
        options: {
            responsive: true,
            plugins: {
                title: chartOptions.getTitle(
                    `Histograma de Investimentos em P&D (% do PIB) - BRICS (${filteredData.labels[0]}-${filteredData.labels[filteredData.labels.length - 1]})`
                ),
                legend: chartOptions.getLegend('none'),
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Investimento (% do PIB)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequência'
                    },
                    beginAtZero: true
                }
            }
        }
    };

    globalChart = new Chart(ctx, config);
}

function chartBoxplot(event) {
    chartDestroy();

    const filteredData = getFilteredChartData();

    const boxplotData = {
        labels: Object.values(filteredData.countries).map((c) => c.label),
        datasets: [
            {
                label: "Investimento em P&D",
                data: Object.values(filteredData.countries).map((c) => c.data),
                backgroundColor: Object.values(filteredData.countries).map(
                    (c) => c.color + "80"
                ),
                borderColor: Object.values(filteredData.countries).map((c) => c.color),
                borderWidth: 2,
                outlierColor: Object.values(filteredData.countries).map((c) => c.color),
                padding: 10,
                itemRadius: 3,
                medianColor: Object.values(filteredData.countries).map((c) => c.color),
                lowerBackgroundColor: Object.values(filteredData.countries).map(
                    (c) => c.color + "20"
                ),
            },
        ],
    };

    const config = {
        type: "boxplot",
        data: boxplotData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: chartOptions.getTitle(
                    `Distribuição dos Investimentos em P&D por País (${filteredData.labels[0]}-${filteredData.labels[filteredData.labels.length - 1]})`
                ),
                legend: chartOptions.getLegend("none"),
            },
            scales: chartOptions.getScales(
                "País",
                "Investimento em P&D (% do PIB)",
                0.5,
                2.5,
                0.5
            ),
        },
    };

    globalChart = new Chart(ctx, config);
}

function chartSelect(event, chartFunction) {
    chartDestroy();
    event.currentTarget.classList.add("active");
    const buttons = document.getElementsByClassName("cardChart");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i] !== event.currentTarget) {
            buttons[i].classList.remove("active");
        }
    }
    chartFunction(event);
}

function load() {
    document
        .getElementById("btnEvolucao")
        .addEventListener("click", (event) => {
            chartSelect(event, chartEvolucao);
        });
    document.getElementById("btnRanking").addEventListener("click", (event) => {
        chartSelect(event, chartRanking);
    });
    document
        .getElementById("btnComparacao")
        .addEventListener("click", (event) => {
            chartSelect(event, chartComparacao);
        });
    document
        .getElementById("btnHistograma")
        .addEventListener("click", (event) => {
            chartSelect(event, chartHistograma);
        });
    document.getElementById("btnBoxplot").addEventListener("click", (event) => {
        chartSelect(event, chartBoxplot);
    });

    document.getElementById("btnEvolucao").click();
}

window.onload = load;