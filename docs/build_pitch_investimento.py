"""Pitch de investimento Canaã Delas - PDF 16:9, vetorial e editável por código.

Dados públicos aparecem com fonte. Valores financeiros e metas são hipóteses
para discussão, não receita, financiamento ou impacto já comprovados.
"""

from pathlib import Path
from math import cos, sin, pi
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "Canaa-Delas-Pitch-Estrategico.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

W, H = 960, 540
FONT_DIR = Path("C:/Windows/Fonts")
pdfmetrics.registerFont(TTFont("Calibri", str(FONT_DIR / "calibri.ttf")))
pdfmetrics.registerFont(TTFont("CalibriBold", str(FONT_DIR / "calibrib.ttf")))
pdfmetrics.registerFont(TTFont("CalibriLight", str(FONT_DIR / "calibril.ttf")))

INK = HexColor("#252139")
PLUM = HexColor("#502947")
PINK = HexColor("#E85878")
ROSE = HexColor("#F8C5CE")
PALE = HexColor("#FFF7F5")
CREAM = HexColor("#FFF0E9")
WHITE = HexColor("#FFFFFF")
MUTED = HexColor("#6A6170")
LINE = HexColor("#EADCE1")
GREEN = HexColor("#236B5F")
MINT = HexColor("#DFF1E9")
GOLD = HexColor("#E5AD54")

c = canvas.Canvas(str(OUT), pagesize=(W, H))
c.setTitle("Canaã Delas | Pitch estratégico e proposta de piloto")
c.setAuthor("Canaã Delas")
c.setSubject("Produto, impacto, marketing, financiamento e validação")
PAGE = 0

SOURCES = {
    "ibge": ("IBGE | Cidades e Estados, Canaã dos Carajás (Censo 2022; estimativa 2025)",
             "https://www.ibge.gov.br/cidades-e-estados/pa/canaa-dos-carajas.html"),
    "inca": ("INCA | Estimativa 2026-2028, câncer do colo do útero",
             "https://www.gov.br/inca/pt-br/assuntos/cancer/tipos/colo-do-utero/versao-para-populacao"),
    "inca_norte": ("INCA | Estimativa de casos novos, Região Norte, 2026",
                   "https://www.gov.br/inca/pt-br/assuntos/cancer/numeros/estimativa/regiao/norte"),
    "who": ("OMS | Estratégia global para eliminação do câncer do colo do útero",
            "https://www.who.int/initiatives/cervical-cancer-elimination-initiative"),
    "semsa": ("Prefeitura de Canaã dos Carajás | Secretaria Municipal de Saúde",
              "https://www.canaadoscarajas.pa.gov.br/novo/saude/"),
    "fapespa": ("Fapespa | Edital 002/2026, Centelha 3 Pará (verificar cronograma)",
                "https://www.fapespa.pa.gov.br/2026/03/26/edital-no-002-2026programa-nacional-de-apoio-a-geracao-de-empreendimentos-inovadoresprograma-centelha-3-para/"),
    "vale": ("Vale | Investimento social em mulheres em Canaã dos Carajás",
             "https://vale.com/pt/w/funda%C3%A7%C3%A3o-banco-do-brasil-e-vale-firmam-parceria-para-inser%C3%A7%C3%A3o-socioprodutiva-de-mulheres-no-par%C3%A1/-/categories/64946"),
}


def txt(x, y, s, size=14, color=INK, font="Calibri", tracking=None):
    c.setFillColor(color)
    c.setFont(font, size)
    if tracking is None:
        c.drawString(x, y, s)
    else:
        t = c.beginText(x, y)
        t.setCharSpace(tracking)
        t.textOut(s)
        c.drawText(t)


def wrap(s, max_w, size=14, font="Calibri"):
    lines, line = [], ""
    for word in s.split():
        candidate = f"{line} {word}".strip()
        if pdfmetrics.stringWidth(candidate, font, size) <= max_w:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def para(x, y, s, width, size=14, color=MUTED, leading=None, font="Calibri"):
    leading = leading or size * 1.35
    for line in wrap(s, width, size, font):
        txt(x, y, line, size, color, font)
        y -= leading
    return y


def box(x, y, w, h, fill=WHITE, stroke=None, radius=18):
    c.setFillColor(fill)
    c.setStrokeColor(stroke or fill)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=int(stroke is not None))


def flower(cx, cy, r=40, color=PINK, alpha=1):
    c.saveState()
    c.setFillColor(Color(color.red, color.green, color.blue, alpha=alpha))
    for i in range(8):
        a = i * pi / 4
        px = cx + cos(a) * r * .66
        py = cy + sin(a) * r * .66
        c.circle(px, py, r * .42, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.circle(cx, cy, r * .25, fill=1, stroke=0)
    c.restoreState()


def petal_pattern():
    c.saveState()
    for x, y, r, a in [(930, 510, 130, .09), (0, 0, 125, .06), (800, -40, 80, .07)]:
        flower(x, y, r, PINK, a)
    c.restoreState()


def base(kicker, title, sub=None, dark=False):
    global PAGE
    PAGE += 1
    c.setFillColor(PLUM if dark else PALE)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    petal_pattern()
    txt(58, 496, kicker.upper(), 11, ROSE if dark else PINK, "CalibriBold", 1.2)
    txt(58, 447, title, 31, WHITE if dark else INK, "CalibriBold")
    if sub:
        para(59, 417, sub, 840, 15, ROSE if dark else MUTED, 20)
    c.setStrokeColor(Color(1, 1, 1, .25) if dark else LINE)
    c.line(58, 47, 902, 47)
    txt(58, 27, "CANAÃ DELAS  /  PITCH ESTRATÉGICO  /  SET 2026", 9,
        ROSE if dark else MUTED, "CalibriBold", .5)
    txt(882, 27, f"{PAGE:02d}", 10, ROSE if dark else MUTED, "CalibriBold")


def badge(x, y, label, color=PINK, fill=CREAM):
    w = pdfmetrics.stringWidth(label, "CalibriBold", 10) + 24
    box(x, y, w, 25, fill, radius=12)
    txt(x + 12, y + 8, label, 10, color, "CalibriBold")
    return w


def stat(x, y, w, h, value, label, note=None, fill=WHITE, value_color=PLUM):
    box(x, y, w, h, fill)
    txt(x + 20, y + h - 55, value, 37, value_color, "CalibriBold")
    para(x + 20, y + h - 82, label, w - 40, 14, INK, 18, "CalibriBold")
    if note:
        para(x + 20, y + 30, note, w - 40, 10, MUTED, 13)


def small_card(x, y, w, h, icon, title, body, fill=WHITE):
    box(x, y, w, h, fill)
    box(x + 18, y + h - 59, 40, 40, CREAM, radius=12)
    txt(x + 30, y + h - 46, icon, 18, PINK, "CalibriBold")
    txt(x + 18, y + h - 85, title, 17, INK, "CalibriBold")
    para(x + 18, y + h - 110, body, w - 36, 12.5, MUTED, 17)


def finish():
    c.showPage()


# 01 - CAPA
PAGE += 1
c.setFillColor(PLUM); c.rect(0, 0, W, H, fill=1, stroke=0)
for x, y, r, a in [(860, 480, 165, .15), (850, 95, 110, .12), (550, -30, 80, .09)]:
    flower(x, y, r, PINK, a)
badge(60, 466, "PITCH ESTRATÉGICO 2026", WHITE, HexColor("#7C486B"))
flower(724, 297, 90, PINK)
txt(60, 375, "Canaã", 64, WHITE, "CalibriBold")
txt(60, 307, "Delas", 64, ROSE, "CalibriBold")
txt(61, 249, "Cuidado que floresce com você.", 23, WHITE, "CalibriLight")
para(62, 198, "Uma plataforma de saúde, bem-estar, proteção e comunidade que começa em Canaã dos Carajás - e pode crescer com impacto mensurável.", 525, 16, ROSE, 22)
txt(60, 38, "PRODUTO FUNCIONAL  •  PILOTO PROPOSTO  •  CAPTAÇÃO EM ESTRUTURAÇÃO", 10, ROSE, "CalibriBold")
finish()

# 02 - TESE
base("A oportunidade", "A vida não cabe em um app de ciclo.",
     "O cuidado da mulher é contínuo; as ferramentas costumam ser fragmentadas.")
small_card(58, 135, 262, 224, "1", "Uma pessoa", "Histórico de saúde, emoções, consultas e dúvidas no mesmo percurso.")
small_card(349, 135, 262, 224, "2", "Uma jornada", "Do primeiro registro à prevenção e à busca de apoio local.")
small_card(640, 135, 262, 224, "3", "Um território", "Informação e conexões relevantes para a realidade de Canaã.")
finish()

# 03 - PROBLEMA
base("Problema", "O que se perde entre uma consulta e outra?",
     "Sem um registro acessível, a pessoa precisa reconstruir a própria história repetidamente.")
for x, n, title, body in [
    (58, "01", "Memória dispersa", "Ciclo, sintomas, sono, humor e medicação ficam em lugares diferentes."),
    (350, "02", "Prevenção reativa", "Exames e consultas dependem da lembrança, não de uma rotina de cuidado."),
    (642, "03", "Apoio distante", "Dúvidas e situações de vulnerabilidade exigem informação clara e caminhos locais.")]:
    box(x, 146, 260, 207, WHITE)
    txt(x + 22, 296, n, 33, PINK, "CalibriBold")
    txt(x + 22, 255, title, 17, INK, "CalibriBold")
    para(x + 22, 222, body, 214, 13, MUTED, 18)
box(58, 75, 844, 51, CREAM)
txt(78, 94, "Nossa hipótese:", 14, PLUM, "CalibriBold")
txt(186, 94, "continuidade + linguagem acessível + vínculo local aumentam a adesão ao cuidado.", 14, PLUM)
finish()

# 04 - DADOS
base("Contexto verificado", "Há escala local e uma urgência real.",
     "Os indicadores dimensionam o contexto; não provam, por si só, a eficácia do aplicativo.")
stat(58, 186, 263, 179, "89.524", "habitantes estimados em Canaã", "IBGE, estimativa 2025. Censo 2022: 77.079.")
stat(349, 186, 263, 179, "19.310", "novos casos de câncer do colo do útero/ano no Brasil", "INCA, estimativa para cada ano de 2026-2028.")
stat(640, 186, 262, 179, "2.150", "casos estimados/ano na Região Norte", "INCA, 2026. Não é número municipal.")
box(58, 83, 844, 80, MINT)
txt(78, 134, "A OMS define 90-70-90 para 2030", 17, GREEN, "CalibriBold")
para(78, 111, "Vacinação HPV, rastreamento e tratamento. O app pode apoiar informação e lembretes; não substitui o sistema de saúde.", 800, 12.5, GREEN, 16)
finish()

# 05 - PÚBLICOS
base("Para quem", "Cuidado pessoal, com portas para quem apoia.",
     "A experiência não presume que toda pessoa usuária seja mulher nem que todo acompanhante seja mulher.")
small_card(58, 144, 262, 211, "A", "Pessoa que se cuida", "Ciclo, gestação, bem-estar, exames e informações no seu ritmo.")
small_card(349, 144, 262, 211, "B", "Companheiro(a)", "Modo de apoio com linguagem inclusiva e sem acesso automático aos dados íntimos.")
small_card(640, 144, 262, 211, "C", "Rede de cuidado", "Profissionais e serviços locais podem orientar o piloto, sem receber dados individuais por padrão.")
box(58, 77, 844, 48, CREAM)
txt(78, 94, "Regra de produto: dados íntimos pertencem à pessoa; compartilhar é decisão explícita dela.", 14, PLUM, "CalibriBold")
finish()

# 06 - SOLUÇÃO
base("Solução", "Quatro áreas e uma assistente, no mesmo lugar.",
     "A página inicial abre caminhos de acordo com a necessidade de hoje - não reduz a jornada ao fluxo menstrual.")
cards = [
    (58, 219, "Saúde", "Ciclo, gestação, exames, medicação e histórico."),
    (349, 219, "Bem-estar", "Humor, sono, sintomas e autocuidado."),
    (640, 219, "Proteção", "Direitos, rede de apoio e saída discreta."),
    (204, 89, "Comunidade", "Trocas com privacidade e ações na cidade."),
    (495, 89, "Assistente", "Orientação contextual, com limites claros."),
]
for x, y, title, body in cards:
    box(x, y, 262, 113, WHITE)
    flower(x + 35, y + 76, 12, PINK)
    txt(x + 58, y + 73, title, 17, INK, "CalibriBold")
    para(x + 21, y + 47, body, 220, 12.5, MUTED, 16)
finish()

# 07 - JORNADA / MOCKUP
base("Produto em uso", "Do registro ao próximo passo - em minutos.",
     "Ilustração da experiência proposta; não é captura literal da tela.")
# phone mockup
box(77, 76, 244, 310, INK, radius=30)
box(86, 85, 226, 292, WHITE, radius=24)
txt(105, 345, "9:41", 10, MUTED, "CalibriBold")
flower(281, 341, 12, PINK)
txt(105, 310, "Bom dia, Marina", 17, INK, "CalibriBold")
txt(105, 287, "Seu cuidado, no seu ritmo", 10, MUTED)
box(102, 197, 194, 73, CREAM, radius=15)
txt(116, 241, "SAÚDE", 9, PINK, "CalibriBold")
txt(116, 222, "Seu próximo passo", 14, PLUM, "CalibriBold")
txt(116, 205, "Exame preventivo • 12 out", 10, MUTED)
for i, s in enumerate(["Bem-estar", "Proteção", "Comunidade"]):
    box(102, 155 - i * 29, 194, 24, PALE, radius=8)
    txt(112, 163 - i * 29, s, 10, PLUM, "CalibriBold")
steps = [
    (389, 330, "1. Registrar", "A pessoa anota sintomas, ciclo ou como se sente."),
    (389, 244, "2. Entender", "O histórico organiza padrões e ajuda a preparar perguntas."),
    (389, 158, "3. Agir", "Lembrete, conteúdo educativo ou serviço de apoio local."),
]
for x, y, a, b in steps:
    box(x, y - 38, 489, 70, WHITE)
    txt(x + 19, y + 6, a, 17, PLUM, "CalibriBold")
    para(x + 19, y - 18, b, 449, 12.5, MUTED, 17)
finish()

# 08 - DIFERENCIAÇÃO
base("Posicionamento", "Mais do que monitorar: orientar sem invadir.",
     "Comparação conceitual de categorias, não avaliação técnica de marcas concorrentes.")
xs = [58, 390, 610, 786]
headers = ["Capacidade", "App de ciclo", "Conteúdo", "Canaã Delas"]
for i, s in enumerate(headers):
    txt(xs[i], 347, s, 14, PINK if i == 3 else INK, "CalibriBold")
rows = [
    ("Registro longitudinal", "Sim", "Não", "Sim"),
    ("Orientação contextual", "Variável", "Genérica", "Proposta"),
    ("Serviços do território", "Raro", "Variável", "Prioridade"),
    ("Proteção + comunidade", "Raro", "Raro", "Integrado"),
    ("Controle da memória de IA", "Variável", "Não", "No produto"),
]
for j, row in enumerate(rows):
    y = 308 - j * 46
    box(58, y - 13, 844, 39, WHITE if j % 2 == 0 else CREAM, radius=7)
    for i, s in enumerate(row):
        txt(xs[i] + (9 if i else 13), y, s, 12.5, PLUM if i == 3 else INK, "CalibriBold" if i == 3 else "Calibri")
finish()

# 09 - STATUS
base("Maturidade", "Há produto. Falta evidência de campo.",
     "Ser transparente sobre o estágio aumenta a confiança de parceiros e financiadores.")
box(58, 131, 398, 221, MINT)
txt(80, 317, "JÁ CONSTRUÍDO", 16, GREEN, "CalibriBold")
for i, s in enumerate(["Site responsivo com autenticação e painel", "App mobile em Expo com navegação geral", "Registros, lembretes e conteúdo educativo", "Fluxos de proteção e comunidade"]):
    txt(80, 279 - i * 36, "• " + s, 13, GREEN)
box(481, 131, 421, 221, CREAM)
txt(503, 317, "A VALIDAR NO PILOTO", 16, PLUM, "CalibriBold")
for i, s in enumerate(["Usabilidade e acessibilidade com usuárias reais", "Retenção e conclusão de registros", "Confiança na orientação e nos lembretes", "Integração operacional com parceiros"]):
    txt(503, 279 - i * 36, "• " + s, 13, PLUM)
box(58, 73, 844, 43, WHITE)
txt(78, 88, "Sem usuários ativos, receita, impacto clínico ou patrocinador contratual comprovados neste material.", 12.5, MUTED)
finish()

# 10 - MARKETING
base("Marketing e aquisição", "Crescer pela confiança, não pelo anúncio invasivo.",
     "Estratégia proposta para o piloto local; cada canal exige parceria e consentimento.")
for x, n, title, body in [
    (58, "01", "Escuta no território", "Oficinas em bairros e UBS parceiras; co-criar linguagem, onboarding e prioridades."),
    (349, "02", "Conteúdo útil", "Vídeos curtos sobre prevenção, bem-estar e direitos; distribuição em redes e WhatsApp."),
    (640, "03", "Indicação orgânica", "Convite por quem confia no produto: usuárias, lideranças e profissionais, sem expor dados.")]:
    box(x, 151, 262, 211, WHITE)
    txt(x + 20, 313, n, 30, PINK, "CalibriBold")
    txt(x + 20, 271, title, 16, PLUM, "CalibriBold")
    para(x + 20, 243, body, 220, 12.5, MUTED, 17)
box(58, 78, 844, 52, MINT)
txt(78, 99, "Métrica norte: pessoas que voltam e concluem uma ação de cuidado - não downloads isolados.", 13.5, GREEN, "CalibriBold")
finish()

# 11 - FUNIL
base("Plano de piloto", "Um experimento de 12 meses, com decisão por marcos.",
     "Metas de trabalho sugeridas, a calibrar após escuta e linha de base.")
milestones = [
    ("M1-M2", "Preparar", "Governança, parceiros, acessibilidade, consentimento e protocolo de segurança."),
    ("M3-M5", "Aprender", "Entrevistas, testes guiados e ajustes de linguagem/fluxo."),
    ("M6-M9", "Operar", "Piloto local, suporte e análise mensal de métricas agregadas."),
    ("M10-M12", "Decidir", "Avaliação independente e decisão de expansão ou correção de rumo."),
]
for i, (time, title, body) in enumerate(milestones):
    x = 58 + i * 215
    box(x, 142, 198, 209, WHITE)
    badge(x + 15, 312, time)
    txt(x + 15, 265, title, 18, INK, "CalibriBold")
    para(x + 15, 237, body, 168, 12, MUTED, 16)
box(58, 80, 844, 42, CREAM)
txt(78, 95, "Indicadores: ativação, retenção 30 dias, lembretes concluídos, satisfação e incidentes de privacidade.", 12.5, PLUM)
finish()

# 12 - MODELO
base("Modelo de sustentabilidade", "A usuária não precisa financiar o acesso.",
     "Receitas futuras dependem de validação, negociação e contratação - nenhuma está garantida.")
small_card(58, 150, 262, 207, "1", "Piloto patrocinado", "Apoio institucional ou investimento social para testar e medir impacto com independência.")
small_card(349, 150, 262, 207, "2", "Contrato B2B/B2G", "Licença de plataforma, implantação e suporte para organizações; contratação pública segue regras próprias.")
small_card(640, 150, 262, 207, "3", "Serviços opcionais", "Educação e implantação para parceiros, sem vender dados pessoais ou transformar a proteção em produto.")
box(58, 80, 844, 48, MINT)
txt(78, 98, "Princípio econômico: receita por serviço prestado; dados sensíveis não são moeda de troca.", 13.5, GREEN, "CalibriBold")
finish()

# 13 - FINANCIADORES
base("Quem pode financiar", "Três portas possíveis para bancar a prova.",
     "Alvos de abordagem, não apoiadores confirmados. Editais, elegibilidade e prazos devem ser rechecados.")
for x, no, name, detail in [
    (58, "01", "Fomento à inovação", "Fapespa/Centelha Pará: subvenção e bolsas, conforme edital e elegibilidade."),
    (349, "02", "Investimento social", "Empresas com atuação em Canaã, como a Vale, podem avaliar patrocínio de piloto e formação."),
    (640, "03", "Gestão municipal", "SEMSA pode ser parceira técnica; eventual compra exige avaliação jurídica, orçamento e contratação regular."),
]:
    box(x, 141, 262, 215, WHITE)
    txt(x + 18, 315, no, 32, PINK, "CalibriBold")
    txt(x + 18, 273, name, 16, PLUM, "CalibriBold")
    para(x + 18, 245, detail, 222, 12.3, MUTED, 17)
box(58, 79, 844, 43, CREAM)
txt(78, 95, "Pedido inicial: parceria de piloto + recursos financeiros + acesso a campo, com governança independente.", 12.5, PLUM, "CalibriBold")
finish()

# 14 - BUDGET
base("Pedido financeiro", "R$ 240 mil para 12 meses de piloto.",
     "Orçamento ilustrativo, sujeito a cotações, escopo final e contrapartidas; não é valor aprovado.")
items = [
    ("Produto e engenharia", 90, PINK),
    ("Equipe de campo e suporte", 54, PLUM),
    ("Pesquisa e avaliação", 48, GOLD),
    ("Privacidade e segurança", 24, GREEN),
    ("Infraestrutura e IA", 24, HexColor("#9F8297")),
]
for i, (label, amount, color) in enumerate(items):
    y = 334 - i * 54
    txt(58, y + 10, label, 13, INK, "CalibriBold")
    box(269, y, 500, 30, CREAM, radius=8)
    box(269, y, amount / 90 * 500, 30, color, radius=8)
    txt(790, y + 9, f"R$ {amount} mil", 14, PLUM, "CalibriBold")
box(58, 70, 844, 43, MINT)
txt(78, 86, "Condição de liberação proposta: parcelas ligadas a entregas, indicadores e prestação de contas.", 12.5, GREEN, "CalibriBold")
finish()

# 15 - CENÁRIO
base("Economia do projeto", "Qual seria o caminho para se sustentar?",
     "Exemplo de cálculo, não previsão de vendas nem preço validado pelo mercado.")
stat(58, 177, 263, 180, "R$ 240 mil", "custo total do piloto de 12 meses", "Premissa orçamentária deste deck.")
stat(349, 177, 263, 180, "R$ 120 mil", "contrato anual hipotético por organização", "Preço apenas para testar viabilidade.")
stat(640, 177, 262, 180, "2", "contratos equivalentes para cobrir o orçamento", "240 ÷ 120; sem margem, tributos ou expansão.")
box(58, 74, 844, 86, CREAM)
for i, (label, amount, color) in enumerate([
    ("Custo do piloto", 240, PLUM),
    ("1 contrato (hip.)", 120, GOLD),
    ("2 contratos (hip.)", 240, PINK),
]):
    y = 143 - i * 21
    txt(75, y, label, 10.5, PLUM, "CalibriBold")
    box(216, y - 2, amount / 240 * 450, 13, color, radius=5)
    txt(685, y, f"R$ {amount} mil", 10.5, PLUM, "CalibriBold")
txt(75, 80, "Não inclui margem, tributos ou expansão. Retenção, custo por pessoa ativa e preço devem ser validados.", 10, MUTED)
finish()

# 16 - RISCO
base("Segurança e ética", "Confiança é parte do produto, não um rodapé.",
     "Saúde e proteção exigem desenho responsável antes de escalar.")
for x, y, title, body in [
    (58, 238, "Privacidade", "Consentimento claro, minimização, exclusão e controle sobre memória e exportação."),
    (495, 238, "Conteúdo responsável", "Informação educativa; IA não diagnostica, prescreve ou substitui profissionais."),
    (58, 100, "Proteção", "Saída discreta, acesso restrito e cuidado com notificações em contextos de violência."),
    (495, 100, "Avaliação", "Métricas agregadas, revisão humana e plano de resposta a incidentes."),
]:
    box(x, y, 407, 111, WHITE)
    flower(x + 30, y + 78, 12, PINK)
    txt(x + 54, y + 76, title, 17, PLUM, "CalibriBold")
    para(x + 20, y + 49, body, 365, 12.2, MUTED, 16)
finish()

# 17 - ASK
base("Convite", "Vamos provar, juntas, o cuidado que fica.",
     "O próximo passo é um piloto com critérios claros - e parceiros que queiram construir com responsabilidade.", dark=True)
box(58, 156, 844, 204, HexColor("#683A5A"))
flower(806, 258, 63, PINK)
txt(86, 319, "O QUE BUSCAMOS", 15, ROSE, "CalibriBold")
for i, s in enumerate(["R$ 240 mil em financiamento ou contrapartidas equivalentes", "Parceria de campo com a rede local para escuta e validação", "Mentoria clínica, jurídica e de avaliação de impacto"]):
    txt(86, 280 - i * 43, "• " + s, 15, WHITE)
txt(58, 119, "Entregável em 12 meses: produto testado, métricas auditáveis e decisão de escala.", 16, WHITE, "CalibriBold")
txt(58, 81, "Equipe e contatos: inserir nomes e canal oficial antes de enviar a investidores.", 12, ROSE)
finish()

# 18 - FONTES / ASSUNÇÕES
base("Fontes e transparência", "O que é fato, proposta e hipótese.",
     "Links públicos para conferência; consulta em 16/09/2026.")
txt(58, 362, "DADOS E CONTEXTO", 13, PINK, "CalibriBold")
for i, key in enumerate(["ibge", "inca", "inca_norte", "who", "semsa", "fapespa", "vale"]):
    label, url = SOURCES[key]
    y = 334 - i * 37
    txt(58, y, label, 11.3, PLUM, "CalibriBold")
    c.linkURL(url, (58, y - 4, 902, y + 16), relative=0)
txt(58, 66, "Projeções: metas, canais, preço e orçamento são cenários de trabalho. Validação e patrocínio ainda não foram comprovados.", 11.2, MUTED)
finish()

c.save()
print(f"Criado: {OUT} ({PAGE} páginas)")
