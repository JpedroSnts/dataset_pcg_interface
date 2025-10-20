let globalChart = null;
const ctx = document.getElementById("bricsChart").getContext("2d");

function chartDestroy() {
    if (globalChart) {
        globalChart.destroy();
    }
}

function chartEvolucao(event, withMedia = false) {
    chartDestroy();

    const datasetList = Object.entries(data.countries).map(([key, value]) => {
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

        for (let i = 0; i < data.labelsData.length; i++) {
            let sum = 0;
            for (const countryKey in data.countries) {
                sum += data.countries[countryKey].data[i];
            }
            avgData.push(sum / Object.keys(data.countries).length);
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
        labels: data.labelsData,
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
                title: chartOptions.getTitle("Evolução dos Investimentos em P&D (% do PIB) - BRICS (2003-2020)"),
                legend: chartOptions.getLegend(),
            },
            scales: chartOptions.getScales("Ano", "Investimento (% do PIB)", 0.5, 2.5),
        },
    };

    globalChart = new Chart(ctx, config);
}

function chartRanking(event) {
    chartDestroy();

    function obterRankingPais(paisNome) {
        const paises = Object.keys(data.countries);
        if (!paises.includes(paisNome)) {
            throw new Error(`País "${paisNome}" não encontrado.`);
        }

        const anos = data.labelsData;
        const resultado = [];

        anos.forEach((_, index) => {
            const valoresAno = paises.map(pais => ({
                pais,
                valor: data.countries[pais].data[index]
            }));

            valoresAno.sort((a, b) => b.valor - a.valor);
            const posicao = valoresAno.findIndex(item => item.pais === paisNome) + 1;
            resultado.push(posicao);
        });

        return resultado;
    }
    
    const dados = {
        labels: data.labelsData,
        datasets: Object.entries(data.countries).map(([key, value]) => {
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
                title: chartOptions.getTitle("Ranking em Investimentos em P&D entre os BRICS (2003–2020)"),
                legend: chartOptions.getLegend(),
            },
            scales: chartOptions.getScales("Ano", "Posição no Ranking", 0, 6, 1, true),
        },
    };

    globalChart = new Chart(ctx, config);
}

function chartComparacao(event) {
    chartEvolucao(event, true);
}

function chartHistograma(event) {
    chartDestroy();
}

function chartBoxplot(event) {
    chartDestroy();
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
    document.getElementById("btnEvolucao").addEventListener("click", (event) => {
        chartSelect(event, chartEvolucao);
    });
    document.getElementById("btnRanking").addEventListener("click", (event) => {
        chartSelect(event, chartRanking);
    });
    document.getElementById("btnComparacao").addEventListener("click", (event) => {
        chartSelect(event, chartComparacao);
    });
    document.getElementById("btnHistograma").addEventListener("click", (event) => {
        chartSelect(event, chartHistograma);
    });
    document.getElementById("btnBoxplot").addEventListener("click", (event) => {
        chartSelect(event, chartBoxplot);
    });

    document.getElementById("btnEvolucao").click();
}

window.onload = load;