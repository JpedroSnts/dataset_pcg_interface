// ========================================
// FUNCIONALIDADES DE ACESSIBILIDADE
// ========================================

// ===== 1. LEITOR DE TELA (Text-to-Speech) =====
let speechActive = false;
let utterance = null;

function toggleTalkback() {
    speechActive = !speechActive;
    
    if (!('speechSynthesis' in window)) {
        alert("Leitor de tela não suportado neste navegador");
        return;
    }
    
    if (speechActive) {
        speak("Leitor de tela ativado. Passe o mouse sobre os elementos para ouvi-los.");
        addHoverListeners();
    } else {
        speak("Leitor de tela desativado.");
        removeHoverListeners();
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    }
}

function speak(text) {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
}

function addHoverListeners() {
    const elements = document.querySelectorAll('button, a, .cardChart, .btnControl');
    elements.forEach(element => {
        element.addEventListener('mouseenter', handleHover);
    });
}

function removeHoverListeners() {
    const elements = document.querySelectorAll('button, a, .cardChart, .btnControl');
    elements.forEach(element => {
        element.removeEventListener('mouseenter', handleHover);
    });
}

function handleHover(e) {
    if (!speechActive) return;
    
    let text = '';
    
    // Pega o texto do elemento
    if (e.target.getAttribute('aria-label')) {
        text = e.target.getAttribute('aria-label');
    } else if (e.target.getAttribute('title')) {
        text = e.target.getAttribute('title');
    } else if (e.target.classList.contains('cardChart')) {
        const title = e.target.querySelector('.cardChartTitle');
        const desc = e.target.querySelector('.cardChartDescricao');
        text = `${title ? title.textContent : ''} - ${desc ? desc.textContent : ''}`;
    } else if (e.target.textContent) {
        text = e.target.textContent.trim();
    } else if (e.target.alt) {
        text = e.target.alt;
    } else {
        text = 'Elemento sem descrição';
    }
    
    if (text) {
        speak(text);
    }
}

// ===== 2. ZOOM =====
let zoomLevel = 0;

function toggleZoom() {
    zoomLevel = (zoomLevel + 1) % 4; // 0, 1, 2, 3, volta para 0
    
    // Remove todas as classes de zoom
    document.body.classList.remove('zoom-1', 'zoom-2', 'zoom-3');
    
    // Adiciona a classe correspondente
    if (zoomLevel > 0) {
        document.body.classList.add(`zoom-${zoomLevel}`);
    }
    
    const zoomTexts = [
        'Zoom padrão - 100%',
        'Zoom aumentado - 110%',
        'Zoom aumentado - 120%',
        'Zoom aumentado - 130%'
    ];
    
    // Notifica o usuário
    console.log(zoomTexts[zoomLevel]);
    
    if (speechActive) {
        speak(zoomTexts[zoomLevel]);
    }
}

// ===== 3. ALTO CONTRASTE =====
let highContrastActive = false;

function toggleHighContrast() {
    highContrastActive = !highContrastActive;
    document.body.classList.toggle('high-contrast');
    
    const message = highContrastActive ? 
        "Alto contraste ativado" : 
        "Alto contraste desativado";
    
    console.log(message);
    
    if (speechActive) {
        speak(message);
    }
    
    // Se houver um gráfico ativo, precisamos recarregá-lo com cores apropriadas
    if (typeof globalChart !== 'undefined' && globalChart) {
        if (highContrastActive) {
            updateChartColors();
        } else {
            restoreChartColors();
        }
    }
}

function updateChartColors() {
    // Atualiza as cores do gráfico para alto contraste
    if (typeof globalChart !== 'undefined' && globalChart && globalChart.data.datasets) {
        globalChart.data.datasets.forEach((dataset, index) => {
            const highContrastColors = [
                '#FFFF00', // Amarelo
                '#00FFFF', // Ciano
                '#FF00FF', // Magenta
                '#00FF00', // Verde
                '#FFFFFF', // Branco
                '#FFA500'  // Laranja
            ];
            dataset.borderColor = highContrastColors[index % highContrastColors.length];
            dataset.backgroundColor = highContrastColors[index % highContrastColors.length];
        });
        globalChart.update();
    }
}

function restoreChartColors() {
    // Restaura as cores originais
    if (typeof globalChart !== 'undefined' && globalChart && globalChart.data.datasets && typeof data !== 'undefined') {
        const originalColors = ['#2CA02C', '#1F77B4', '#FF7F0E', '#E377C2', '#17BECF', '#990F02'];
        globalChart.data.datasets.forEach((dataset, index) => {
            const countryKeys = Object.keys(data.countries);
            const countryKey = countryKeys[index];
            if (countryKey && data.countries[countryKey]) {
                dataset.borderColor = data.countries[countryKey].color;
                dataset.backgroundColor = data.countries[countryKey].color;
            } else {
                dataset.borderColor = originalColors[index % originalColors.length];
                dataset.backgroundColor = originalColors[index % originalColors.length];
            }
        });
        globalChart.update();
    }
}

// ===== 4. TRADUTOR =====
function openTranslator() {
    const currentUrl = encodeURIComponent(window.location.href);
    const translateUrl = `https://translate.google.com/translate?sl=pt&tl=en&u=${currentUrl}`;
    window.open(translateUrl, '_blank');
    
    console.log("Abrindo tradutor em nova aba");
    
    if (speechActive) {
        speak("Abrindo tradutor em nova aba");
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Inicializando sistema de acessibilidade...');
    
    const accessibilityButtons = document.querySelectorAll('#ulAcessibilidade button');
    console.log('✓ Botões de acessibilidade encontrados:', accessibilityButtons.length);
    
    // Botão 1: Leitor de tela
    if (accessibilityButtons[0]) {
        accessibilityButtons[0].addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔊 Leitor de tela clicado');
            toggleTalkback();
        });
        console.log('✓ Leitor de tela configurado');
    }
    
    // Botão 2: Zoom
    if (accessibilityButtons[1]) {
        accessibilityButtons[1].addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔍 Zoom clicado');
            toggleZoom();
        });
        console.log('✓ Zoom configurado');
    }
    
    // Botão 3: Tradutor
    if (accessibilityButtons[2]) {
        accessibilityButtons[2].addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🌐 Tradutor clicado');
            openTranslator();
        });
        console.log('✓ Tradutor configurado');
    }
    
    // Botão 4: Alto Contraste
    if (accessibilityButtons[3]) {
        accessibilityButtons[3].addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🎨 Alto contraste clicado');
            toggleHighContrast();
        });
        console.log('✓ Alto contraste configurado');
    }
    
    // ===== ATALHOS DE TECLADO =====
    document.addEventListener('keydown', function(e) {
        // Alt + T = Talkback/Leitor de tela
        if (e.altKey && e.key.toLowerCase() === 't') {
            e.preventDefault();
            console.log('⌨️ Atalho Alt+T pressionado');
            toggleTalkback();
        }
        
        // Alt + Z = Zoom
        if (e.altKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            console.log('⌨️ Atalho Alt+Z pressionado');
            toggleZoom();
        }
        
        // Alt + C = Alto Contraste
        if (e.altKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            console.log('⌨️ Atalho Alt+C pressionado');
            toggleHighContrast();
        }
        
        // Alt + D = Tradutor
        if (e.altKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            console.log('⌨️ Atalho Alt+D pressionado');
            openTranslator();
        }
    });
    
    console.log("✅ Sistema de acessibilidade carregado com sucesso!");
    console.log("📋 Atalhos disponíveis:");
    console.log("   • Alt + T: Ativar/Desativar leitor de tela");
    console.log("   • Alt + Z: Alternar zoom (4 níveis)");
    console.log("   • Alt + C: Ativar/Desativar alto contraste");
    console.log("   • Alt + D: Abrir tradutor");
    console.log("💡 Clique nos ícones no canto superior direito ou use os atalhos!");
});