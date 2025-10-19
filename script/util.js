const chartOptions = {
    getTitle: (text) => ({
        display: true,
        text: text,
    }),
    getLegend: (position = "right") => ({
        position: position,
        labels: {
            boxWidth: 15,
        },
    }),
    getScales: (xTitle, yTitle, yMin, yMax, steps = null, reverse = false) => ({
        x: {
            title: {
                display: true,
                text: xTitle,
            },
        },
        y: {
            reverse,
            title: {
                display: true,
                text: yTitle,
            },
            min: yMin,
            max: yMax,
            ticks: {
                stepSize: steps,
                autoSkip: true
            }
        }
    })
}

