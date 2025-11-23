let globalChart = null;
const ctx = document.getElementById("bricsChart").getContext("2d");

function chartDestroy() {
    if (globalChart) {
        globalChart.destroy();
    }
    
    // Remove o container de histogramas se existir
    const histContainer = document.getElementById('histogramContainer');
    if (histContainer) {
        histContainer.remove();
    }
    
    // Garante que o canvas principal está visível
    const mainCanvas = document.getElementById('bricsChart');
    if (mainCanvas) {
        mainCanvas.style.display = 'block';
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
    
    // Oculta o canvas principal e mostra o container de histogramas
    const mainCanvas = document.getElementById('bricsChart');
    mainCanvas.style.display = 'none';
    
    // Cria ou limpa o container de histogramas múltiplos
    let histContainer = document.getElementById('histogramContainer');
    if (!histContainer) {
        histContainer = document.createElement('div');
        histContainer.id = 'histogramContainer';
        histContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            padding: 20px;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
        `;
        mainCanvas.parentElement.appendChild(histContainer);
    } else {
        histContainer.innerHTML = '';
    }
    
    // Função para criar bins de histograma
    function createHistogramBins(countryData, binCount = 6) {
        const min = Math.min(...countryData);
        const max = Math.max(...countryData);
        const binSize = (max - min) / binCount;

        const bins = Array(binCount).fill(0);
        const binLabels = [];

        for (let i = 0; i < binCount; i++) {
            const binStart = min + (i * binSize);
            const binEnd = binStart + binSize;
            binLabels.push(`${binStart.toFixed(2)}`);

            countryData.forEach(value => {
                if (value >= binStart && (i === binCount - 1 ? value <= binEnd : value < binEnd)) {
                    bins[i]++;
                }
            });
        }

        return { bins, binLabels };
    }
    
    // Cria um gráfico para cada país
    Object.entries(filteredData.countries).forEach(([key, country]) => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'max-height: 300px;';
        wrapper.appendChild(canvas);
        histContainer.appendChild(wrapper);
        
        const { bins, binLabels } = createHistogramBins(country.data);
        
        const chartData = {
            labels: binLabels,
            datasets: [{
                label: 'Frequência',
                data: bins,
                backgroundColor: country.color + 'CC',
                borderColor: country.color,
                borderWidth: 2
            }]
        };
        
        const maxFreq = Math.max(...bins);
        
        new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: country.label,
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: {
                            top: 5,
                            bottom: 10
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Investimento (% do PIB)',
                            font: {
                                size: 11
                            }
                        },
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Frequência',
                            font: {
                                size: 11
                            }
                        },
                        beginAtZero: true,
                        max: maxFreq + 1,
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    });
    
    if (speechActive) {
        speak(`Histogramas individuais criados para ${Object.keys(filteredData.countries).length} países`);
    }
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