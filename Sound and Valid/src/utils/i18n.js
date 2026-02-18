/**
 * Lightweight i18n module.
 *
 * Supports EN, ES, ZH (Simplified Chinese), AR (Arabic).
 * Language is auto-detected from navigator.language or a stored preference.
 * Call initLocale() once at app startup before any rendering.
 */

const STORAGE_KEY = "fm_lang";
const SUPPORTED = ["en", "es", "zh", "ar"];
const RTL_LOCALES = ["ar"];

let currentLocale = "en";

// ── Translations ──

const translations = {
  en: {
    landing: {
      title: "Sound and Valid",
      subtitle: "Discover how materials shape the sounds around you",
      learnBtn: "Learn what frequency is",
      playBtn: "I'm ready to play",
      edu: {
        heading: "What is Frequency?",
        whatIsSound: "What is Sound?",
        whatIsSoundP1:
          "Sound is a vibration that travels through a medium like air. When an object vibrates, it pushes air molecules back and forth, creating pressure waves that your ear detects.",
        whatIsSoundP2:
          "The speed of these vibrations is called frequency, measured in Hertz (Hz). One Hz means one vibration per second.",
        whatIsSoundP3:
          "Higher frequency = higher pitch. A bass guitar string vibrates around 80 Hz, while a piccolo can reach 4,000 Hz.",
        whatDetermines: "What Determines an Object's Frequency?",
        whatDeterminesIntro:
          "When you tap a metal bar, it vibrates at a specific frequency determined by three things:",
        stiffnessTitle: "1. Stiffness (Young's Modulus, E)",
        stiffnessBody:
          "How resistant the material is to bending. Steel is very stiff (E = 200 GPa), while rubber is soft (E = 0.01 GPa). Stiffer materials vibrate faster \u2192 higher pitch.",
        densityTitle: "2. Density (\u03C1)",
        densityBody:
          "How heavy the material is per unit volume. Lead is very dense (11,340 kg/m\u00B3), aluminum is light (2,700 kg/m\u00B3). Denser materials vibrate slower \u2192 lower pitch.",
        geometryTitle: "3. Geometry (Length & Thickness)",
        geometryBody:
          "A longer bar vibrates slower (lower pitch). A thicker bar vibrates faster (higher pitch). The frequency depends on length squared \u2014 double the length and the frequency drops to one quarter!",
        formulaTitle: "The Formula",
        formulaIntro:
          "This is the Euler\u2013Bernoulli beam equation. It tells us the natural frequency (f) of a vibrating bar based on:",
        formulaBetaL:
          "\u2022 \u03B2L \u2014 a constant that depends on how the bar is held (clamped, free, etc.)",
        formulaH: "\u2022 h \u2014 thickness of the bar",
        formulaL: "\u2022 L \u2014 length of the bar",
        formulaE: "\u2022 E \u2014 stiffness of the material",
        formulaRho: "\u2022 \u03C1 \u2014 density of the material",
        formulaNote:
          "Every object in this app has a frequency computed from this formula with real material data.",
        howToPlay: "How to Play",
        step1: "1. Each challenge gives you an object with a target frequency.",
        step2:
          '2. Tap "Listen" to hear what that frequency sounds like (a pure sine wave).',
        step3:
          '3. Tap "Match" and try to produce that frequency. Hum, whistle, sing, or tap something nearby.',
        step4:
          "4. The tuner shows how close you are. Hold the frequency within 5% of the target for 1.5 seconds to match!",
        step5:
          "5. Check the Sound Catalog to learn about each object and explore how changing its properties affects its frequency.",
        readyBtn: "I'm ready to play!",
      },
    },
  },

  es: {
    landing: {
      title: "Sound and Valid",
      subtitle:
        "Descubre c\u00F3mo los materiales dan forma a los sonidos que te rodean",
      learnBtn: "Aprende qu\u00E9 es la frecuencia",
      playBtn: "Estoy listo para jugar",
      edu: {
        heading: "\u00BFQu\u00E9 es la frecuencia?",
        whatIsSound: "\u00BFQu\u00E9 es el sonido?",
        whatIsSoundP1:
          "El sonido es una vibraci\u00F3n que viaja a trav\u00E9s de un medio como el aire. Cuando un objeto vibra, empuja las mol\u00E9culas de aire hacia adelante y atr\u00E1s, creando ondas de presi\u00F3n que tu o\u00EDdo detecta.",
        whatIsSoundP2:
          "La velocidad de estas vibraciones se llama frecuencia, medida en Hertz (Hz). Un Hz significa una vibraci\u00F3n por segundo.",
        whatIsSoundP3:
          "Mayor frecuencia = tono m\u00E1s alto. Una cuerda de bajo vibra a unos 80 Hz, mientras que un p\u00EDccolo puede alcanzar 4.000 Hz.",
        whatDetermines:
          "\u00BFQu\u00E9 determina la frecuencia de un objeto?",
        whatDeterminesIntro:
          "Cuando golpeas una barra de metal, vibra a una frecuencia espec\u00EDfica determinada por tres cosas:",
        stiffnessTitle: "1. Rigidez (M\u00F3dulo de Young, E)",
        stiffnessBody:
          "Cu\u00E1nto resiste el material a doblarse. El acero es muy r\u00EDgido (E = 200 GPa), mientras que el caucho es blando (E = 0,01 GPa). Los materiales m\u00E1s r\u00EDgidos vibran m\u00E1s r\u00E1pido \u2192 tono m\u00E1s alto.",
        densityTitle: "2. Densidad (\u03C1)",
        densityBody:
          "Cu\u00E1nto pesa el material por unidad de volumen. El plomo es muy denso (11.340 kg/m\u00B3), el aluminio es ligero (2.700 kg/m\u00B3). Los materiales m\u00E1s densos vibran m\u00E1s lento \u2192 tono m\u00E1s bajo.",
        geometryTitle: "3. Geometr\u00EDa (Longitud y Espesor)",
        geometryBody:
          "Una barra m\u00E1s larga vibra m\u00E1s lento (tono m\u00E1s bajo). Una barra m\u00E1s gruesa vibra m\u00E1s r\u00E1pido (tono m\u00E1s alto). La frecuencia depende del cuadrado de la longitud: \u00A1duplica la longitud y la frecuencia cae a una cuarta parte!",
        formulaTitle: "La f\u00F3rmula",
        formulaIntro:
          "Esta es la ecuaci\u00F3n de viga de Euler\u2013Bernoulli. Nos dice la frecuencia natural (f) de una barra vibrante en funci\u00F3n de:",
        formulaBetaL:
          "\u2022 \u03B2L \u2014 una constante que depende de c\u00F3mo se sujeta la barra (empotrada, libre, etc.)",
        formulaH: "\u2022 h \u2014 espesor de la barra",
        formulaL: "\u2022 L \u2014 longitud de la barra",
        formulaE: "\u2022 E \u2014 rigidez del material",
        formulaRho: "\u2022 \u03C1 \u2014 densidad del material",
        formulaNote:
          "Cada objeto en esta aplicaci\u00F3n tiene una frecuencia calculada a partir de esta f\u00F3rmula con datos reales de materiales.",
        howToPlay: "C\u00F3mo jugar",
        step1: "1. Cada desaf\u00EDo te da un objeto con una frecuencia objetivo.",
        step2:
          '2. Toca "Escuchar" para o\u00EDr c\u00F3mo suena esa frecuencia (una onda sinusoidal pura).',
        step3:
          '3. Toca "Igualar" e intenta producir esa frecuencia. Tararea, silba, canta o golpea algo cercano.',
        step4:
          "4. El afinador muestra qu\u00E9 tan cerca est\u00E1s. \u00A1Mant\u00E9n la frecuencia dentro del 5% del objetivo durante 1,5 segundos para igualar!",
        step5:
          "5. Consulta el Cat\u00E1logo de Sonidos para aprender sobre cada objeto y explorar c\u00F3mo cambiar sus propiedades afecta su frecuencia.",
        readyBtn: "\u00A1Estoy listo para jugar!",
      },
    },
  },

  zh: {
    landing: {
      title: "Sound and Valid",
      subtitle: "\u63A2\u7D22\u6750\u6599\u5982\u4F55\u5851\u9020\u4F60\u5468\u56F4\u7684\u58F0\u97F3",
      learnBtn: "\u4E86\u89E3\u4EC0\u4E48\u662F\u9891\u7387",
      playBtn: "\u6211\u51C6\u5907\u597D\u4E86",
      edu: {
        heading: "\u4EC0\u4E48\u662F\u9891\u7387\uFF1F",
        whatIsSound: "\u4EC0\u4E48\u662F\u58F0\u97F3\uFF1F",
        whatIsSoundP1:
          "\u58F0\u97F3\u662F\u901A\u8FC7\u4ECB\u8D28\uFF08\u5982\u7A7A\u6C14\uFF09\u4F20\u64AD\u7684\u632F\u52A8\u3002\u5F53\u7269\u4F53\u632F\u52A8\u65F6\uFF0C\u5B83\u4F1A\u63A8\u52A8\u7A7A\u6C14\u5206\u5B50\u6765\u56DE\u8FD0\u52A8\uFF0C\u4EA7\u751F\u4F60\u7684\u8033\u6735\u53EF\u4EE5\u68C0\u6D4B\u5230\u7684\u538B\u529B\u6CE2\u3002",
        whatIsSoundP2:
          "\u8FD9\u4E9B\u632F\u52A8\u7684\u901F\u5EA6\u79F0\u4E3A\u9891\u7387\uFF0C\u4EE5\u8D6B\u5179\uFF08Hz\uFF09\u4E3A\u5355\u4F4D\u3002\u4E00\u8D6B\u5179\u8868\u793A\u6BCF\u79D2\u4E00\u6B21\u632F\u52A8\u3002",
        whatIsSoundP3:
          "\u9891\u7387\u8D8A\u9AD8 = \u97F3\u8C03\u8D8A\u9AD8\u3002\u4F4E\u97F3\u5409\u4ED6\u5F26\u7684\u632F\u52A8\u9891\u7387\u7EA6\u4E3A 80 Hz\uFF0C\u800C\u77ED\u7B1B\u53EF\u4EE5\u8FBE\u5230 4,000 Hz\u3002",
        whatDetermines: "\u4EC0\u4E48\u51B3\u5B9A\u4E86\u7269\u4F53\u7684\u9891\u7387\uFF1F",
        whatDeterminesIntro:
          "\u5F53\u4F60\u6572\u51FB\u4E00\u6839\u91D1\u5C5E\u68D2\u65F6\uFF0C\u5B83\u4F1A\u4EE5\u7279\u5B9A\u7684\u9891\u7387\u632F\u52A8\uFF0C\u8FD9\u7531\u4E09\u4E2A\u56E0\u7D20\u51B3\u5B9A\uFF1A",
        stiffnessTitle: "1. \u521A\u5EA6\uFF08\u6768\u6C0F\u6A21\u91CF E\uFF09",
        stiffnessBody:
          "\u6750\u6599\u62B5\u6297\u5F2F\u66F2\u7684\u80FD\u529B\u3002\u94A2\u975E\u5E38\u786C\uFF08E = 200 GPa\uFF09\uFF0C\u800C\u6A61\u80F6\u5F88\u8F6F\uFF08E = 0.01 GPa\uFF09\u3002\u8D8A\u786C\u7684\u6750\u6599\u632F\u52A8\u8D8A\u5FEB \u2192 \u97F3\u8C03\u8D8A\u9AD8\u3002",
        densityTitle: "2. \u5BC6\u5EA6\uFF08\u03C1\uFF09",
        densityBody:
          "\u6750\u6599\u6BCF\u5355\u4F4D\u4F53\u79EF\u7684\u8D28\u91CF\u3002\u94C5\u975E\u5E38\u5BC6\u96C6\uFF0811,340 kg/m\u00B3\uFF09\uFF0C\u94DD\u5F88\u8F7B\uFF082,700 kg/m\u00B3\uFF09\u3002\u8D8A\u5BC6\u96C6\u7684\u6750\u6599\u632F\u52A8\u8D8A\u6162 \u2192 \u97F3\u8C03\u8D8A\u4F4E\u3002",
        geometryTitle: "3. \u51E0\u4F55\u5F62\u72B6\uFF08\u957F\u5EA6\u548C\u539A\u5EA6\uFF09",
        geometryBody:
          "\u8D8A\u957F\u7684\u68D2\u632F\u52A8\u8D8A\u6162\uFF08\u97F3\u8C03\u8D8A\u4F4E\uFF09\u3002\u8D8A\u539A\u7684\u68D2\u632F\u52A8\u8D8A\u5FEB\uFF08\u97F3\u8C03\u8D8A\u9AD8\uFF09\u3002\u9891\u7387\u53D6\u51B3\u4E8E\u957F\u5EA6\u7684\u5E73\u65B9\u2014\u2014\u957F\u5EA6\u52A0\u500D\uFF0C\u9891\u7387\u964D\u4E3A\u56DB\u5206\u4E4B\u4E00\uFF01",
        formulaTitle: "\u516C\u5F0F",
        formulaIntro:
          "\u8FD9\u662F\u6B27\u62C9\u2013\u4F2F\u52AA\u5229\u6881\u65B9\u7A0B\u3002\u5B83\u544A\u8BC9\u6211\u4EEC\u632F\u52A8\u68D2\u7684\u56FA\u6709\u9891\u7387\uFF08f\uFF09\u53D6\u51B3\u4E8E\uFF1A",
        formulaBetaL:
          "\u2022 \u03B2L \u2014 \u4E00\u4E2A\u53D6\u51B3\u4E8E\u68D2\u7684\u56FA\u5B9A\u65B9\u5F0F\u7684\u5E38\u6570\uFF08\u56FA\u5B9A\u3001\u81EA\u7531\u7B49\uFF09",
        formulaH: "\u2022 h \u2014 \u68D2\u7684\u539A\u5EA6",
        formulaL: "\u2022 L \u2014 \u68D2\u7684\u957F\u5EA6",
        formulaE: "\u2022 E \u2014 \u6750\u6599\u7684\u521A\u5EA6",
        formulaRho: "\u2022 \u03C1 \u2014 \u6750\u6599\u7684\u5BC6\u5EA6",
        formulaNote:
          "\u672C\u5E94\u7528\u4E2D\u7684\u6BCF\u4E2A\u7269\u4F53\u90FD\u662F\u7528\u8FD9\u4E2A\u516C\u5F0F\u548C\u771F\u5B9E\u6750\u6599\u6570\u636E\u8BA1\u7B97\u7684\u9891\u7387\u3002",
        howToPlay: "\u5982\u4F55\u73A9",
        step1: "1. \u6BCF\u4E2A\u6311\u6218\u7ED9\u4F60\u4E00\u4E2A\u5E26\u6709\u76EE\u6807\u9891\u7387\u7684\u7269\u4F53\u3002",
        step2:
          "2. \u70B9\u51FB\u201C\u542C\u201D\u6765\u542C\u542C\u90A3\u4E2A\u9891\u7387\u662F\u4EC0\u4E48\u6837\u7684\uFF08\u7EAF\u6B63\u5F26\u6CE2\uFF09\u3002",
        step3:
          "3. \u70B9\u51FB\u201C\u5339\u914D\u201D\u5E76\u5C1D\u8BD5\u53D1\u51FA\u90A3\u4E2A\u9891\u7387\u3002\u54FC\u5531\u3001\u5439\u53E3\u54E8\u3001\u5531\u6B4C\u6216\u6572\u51FB\u9644\u8FD1\u7684\u4E1C\u897F\u3002",
        step4:
          "4. \u8C03\u97F3\u5668\u663E\u793A\u4F60\u6709\u591A\u63A5\u8FD1\u3002\u5C06\u9891\u7387\u4FDD\u6301\u5728\u76EE\u6807\u7684 5% \u4EE5\u5185 1.5 \u79D2\u5373\u53EF\u5339\u914D\uFF01",
        step5:
          "5. \u67E5\u770B\u58F0\u97F3\u76EE\u5F55\uFF0C\u4E86\u89E3\u6BCF\u4E2A\u7269\u4F53\uFF0C\u63A2\u7D22\u6539\u53D8\u5176\u5C5E\u6027\u5982\u4F55\u5F71\u54CD\u5176\u9891\u7387\u3002",
        readyBtn: "\u6211\u51C6\u5907\u597D\u4E86\uFF01",
      },
    },
  },

  ar: {
    landing: {
      title: "Sound and Valid",
      subtitle: "\u0627\u0643\u062A\u0634\u0641 \u0643\u064A\u0641 \u062A\u0634\u0643\u0651\u0644 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0623\u0635\u0648\u0627\u062A \u0645\u0646 \u062D\u0648\u0644\u0643",
      learnBtn: "\u062A\u0639\u0644\u0651\u0645 \u0645\u0627 \u0647\u0648 \u0627\u0644\u062A\u0631\u062F\u062F",
      playBtn: "\u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u0644\u0639\u0628",
      edu: {
        heading: "\u0645\u0627 \u0647\u0648 \u0627\u0644\u062A\u0631\u062F\u062F\u061F",
        whatIsSound: "\u0645\u0627 \u0647\u0648 \u0627\u0644\u0635\u0648\u062A\u061F",
        whatIsSoundP1:
          "\u0627\u0644\u0635\u0648\u062A \u0647\u0648 \u0627\u0647\u062A\u0632\u0627\u0632 \u064A\u0646\u062A\u0642\u0644 \u0639\u0628\u0631 \u0648\u0633\u0637 \u0645\u062B\u0644 \u0627\u0644\u0647\u0648\u0627\u0621. \u0639\u0646\u062F\u0645\u0627 \u064A\u0647\u062A\u0632 \u062C\u0633\u0645 \u0645\u0627\u060C \u0641\u0625\u0646\u0647 \u064A\u062F\u0641\u0639 \u062C\u0632\u064A\u0626\u0627\u062A \u0627\u0644\u0647\u0648\u0627\u0621 \u0630\u0647\u0627\u0628\u064B\u0627 \u0648\u0625\u064A\u0627\u0628\u064B\u0627\u060C \u0645\u0645\u0627 \u064A\u0646\u0634\u0626 \u0645\u0648\u062C\u0627\u062A \u0636\u063A\u0637 \u062A\u0643\u062A\u0634\u0641\u0647\u0627 \u0623\u0630\u0646\u0643.",
        whatIsSoundP2:
          "\u0633\u0631\u0639\u0629 \u0647\u0630\u0647 \u0627\u0644\u0627\u0647\u062A\u0632\u0627\u0632\u0627\u062A \u062A\u0633\u0645\u0649 \u0627\u0644\u062A\u0631\u062F\u062F\u060C \u0648\u062A\u0642\u0627\u0633 \u0628\u0627\u0644\u0647\u0631\u062A\u0632 (Hz). \u0647\u0631\u062A\u0632 \u0648\u0627\u062D\u062F \u064A\u0639\u0646\u064A \u0627\u0647\u062A\u0632\u0627\u0632\u0629 \u0648\u0627\u062D\u062F\u0629 \u0641\u064A \u0627\u0644\u062B\u0627\u0646\u064A\u0629.",
        whatIsSoundP3:
          "\u062A\u0631\u062F\u062F \u0623\u0639\u0644\u0649 = \u0646\u063A\u0645\u0629 \u0623\u0639\u0644\u0649. \u0648\u062A\u0631 \u0627\u0644\u063A\u064A\u062A\u0627\u0631 \u0627\u0644\u0628\u0627\u0635 \u064A\u0647\u062A\u0632 \u0628\u062D\u0648\u0627\u0644\u064A 80 Hz\u060C \u0628\u064A\u0646\u0645\u0627 \u064A\u0645\u0643\u0646 \u0644\u0644\u0628\u064A\u0643\u0648\u0644\u0648 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 4000 Hz.",
        whatDetermines: "\u0645\u0627 \u0627\u0644\u0630\u064A \u064A\u062D\u062F\u062F \u062A\u0631\u062F\u062F \u0627\u0644\u062C\u0633\u0645\u061F",
        whatDeterminesIntro:
          "\u0639\u0646\u062F\u0645\u0627 \u062A\u0637\u0631\u0642 \u0639\u0644\u0649 \u0642\u0636\u064A\u0628 \u0645\u0639\u062F\u0646\u064A\u060C \u0641\u0625\u0646\u0647 \u064A\u0647\u062A\u0632 \u0628\u062A\u0631\u062F\u062F \u0645\u062D\u062F\u062F \u064A\u062A\u062D\u062F\u062F \u0628\u062B\u0644\u0627\u062B\u0629 \u0623\u0634\u064A\u0627\u0621:",
        stiffnessTitle: "1. \u0627\u0644\u0635\u0644\u0627\u0628\u0629 (\u0645\u0639\u0627\u0645\u0644 \u064A\u0648\u0646\u063A E)",
        stiffnessBody:
          "\u0645\u062F\u0649 \u0645\u0642\u0627\u0648\u0645\u0629 \u0627\u0644\u0645\u0627\u062F\u0629 \u0644\u0644\u0627\u0646\u062D\u0646\u0627\u0621. \u0627\u0644\u0641\u0648\u0644\u0627\u0630 \u0635\u0644\u0628 \u062C\u062F\u064B\u0627 (E = 200 GPa)\u060C \u0628\u064A\u0646\u0645\u0627 \u0627\u0644\u0645\u0637\u0627\u0637 \u0644\u064A\u0651\u0646 (E = 0.01 GPa). \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0623\u0643\u062B\u0631 \u0635\u0644\u0627\u0628\u0629 \u062A\u0647\u062A\u0632 \u0623\u0633\u0631\u0639 \u2192 \u0646\u063A\u0645\u0629 \u0623\u0639\u0644\u0649.",
        densityTitle: "2. \u0627\u0644\u0643\u062B\u0627\u0641\u0629 (\u03C1)",
        densityBody:
          "\u0648\u0632\u0646 \u0627\u0644\u0645\u0627\u062F\u0629 \u0644\u0643\u0644 \u0648\u062D\u062F\u0629 \u062D\u062C\u0645. \u0627\u0644\u0631\u0635\u0627\u0635 \u0643\u062B\u064A\u0641 \u062C\u062F\u064B\u0627 (11,340 kg/m\u00B3)\u060C \u0627\u0644\u0623\u0644\u0645\u0646\u064A\u0648\u0645 \u062E\u0641\u064A\u0641 (2,700 kg/m\u00B3). \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0623\u0643\u062B\u0631 \u0643\u062B\u0627\u0641\u0629 \u062A\u0647\u062A\u0632 \u0623\u0628\u0637\u0623 \u2192 \u0646\u063A\u0645\u0629 \u0623\u062E\u0641\u0636.",
        geometryTitle: "3. \u0627\u0644\u0647\u0646\u062F\u0633\u0629 (\u0627\u0644\u0637\u0648\u0644 \u0648\u0627\u0644\u0633\u0645\u0643)",
        geometryBody:
          "\u0627\u0644\u0642\u0636\u064A\u0628 \u0627\u0644\u0623\u0637\u0648\u0644 \u064A\u0647\u062A\u0632 \u0623\u0628\u0637\u0623 (\u0646\u063A\u0645\u0629 \u0623\u062E\u0641\u0636). \u0627\u0644\u0642\u0636\u064A\u0628 \u0627\u0644\u0623\u0633\u0645\u0643 \u064A\u0647\u062A\u0632 \u0623\u0633\u0631\u0639 (\u0646\u063A\u0645\u0629 \u0623\u0639\u0644\u0649). \u0627\u0644\u062A\u0631\u062F\u062F \u064A\u0639\u062A\u0645\u062F \u0639\u0644\u0649 \u0645\u0631\u0628\u0639 \u0627\u0644\u0637\u0648\u0644 \u2014 \u0636\u0627\u0639\u0641 \u0627\u0644\u0637\u0648\u0644 \u0648\u064A\u0646\u062E\u0641\u0636 \u0627\u0644\u062A\u0631\u062F\u062F \u0625\u0644\u0649 \u0627\u0644\u0631\u0628\u0639!",
        formulaTitle: "\u0627\u0644\u0645\u0639\u0627\u062F\u0644\u0629",
        formulaIntro:
          "\u0647\u0630\u0647 \u0645\u0639\u0627\u062F\u0644\u0629 \u0623\u0648\u064A\u0644\u0631\u2013\u0628\u064A\u0631\u0646\u0648\u0644\u064A \u0644\u0644\u0639\u0648\u0627\u0631\u0636. \u062A\u062E\u0628\u0631\u0646\u0627 \u0628\u0627\u0644\u062A\u0631\u062F\u062F \u0627\u0644\u0637\u0628\u064A\u0639\u064A (f) \u0644\u0642\u0636\u064A\u0628 \u0645\u0647\u062A\u0632 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649:",
        formulaBetaL:
          "\u2022 \u03B2L \u2014 \u062B\u0627\u0628\u062A \u064A\u0639\u062A\u0645\u062F \u0639\u0644\u0649 \u0637\u0631\u064A\u0642\u0629 \u062A\u062B\u0628\u064A\u062A \u0627\u0644\u0642\u0636\u064A\u0628 (\u0645\u062B\u0628\u062A\u060C \u062D\u0631\u060C \u0625\u0644\u062E)",
        formulaH: "\u2022 h \u2014 \u0633\u0645\u0643 \u0627\u0644\u0642\u0636\u064A\u0628",
        formulaL: "\u2022 L \u2014 \u0637\u0648\u0644 \u0627\u0644\u0642\u0636\u064A\u0628",
        formulaE: "\u2022 E \u2014 \u0635\u0644\u0627\u0628\u0629 \u0627\u0644\u0645\u0627\u062F\u0629",
        formulaRho: "\u2022 \u03C1 \u2014 \u0643\u062B\u0627\u0641\u0629 \u0627\u0644\u0645\u0627\u062F\u0629",
        formulaNote:
          "\u0643\u0644 \u062C\u0633\u0645 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0644\u0647 \u062A\u0631\u062F\u062F \u0645\u062D\u0633\u0648\u0628 \u0645\u0646 \u0647\u0630\u0647 \u0627\u0644\u0645\u0639\u0627\u062F\u0644\u0629 \u0628\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0648\u0627\u062F \u062D\u0642\u064A\u0642\u064A\u0629.",
        howToPlay: "\u0643\u064A\u0641 \u062A\u0644\u0639\u0628",
        step1: "1. \u0643\u0644 \u062A\u062D\u062F\u064D \u064A\u0639\u0637\u064A\u0643 \u062C\u0633\u0645\u064B\u0627 \u0628\u062A\u0631\u062F\u062F \u0645\u0633\u062A\u0647\u062F\u0641.",
        step2:
          "2. \u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \"\u0627\u0633\u062A\u0645\u0639\" \u0644\u0633\u0645\u0627\u0639 \u0643\u064A\u0641 \u064A\u0628\u062F\u0648 \u0647\u0630\u0627 \u0627\u0644\u062A\u0631\u062F\u062F (\u0645\u0648\u062C\u0629 \u062C\u064A\u0628\u064A\u0629 \u0646\u0642\u064A\u0629).",
        step3:
          "3. \u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \"\u0645\u0637\u0627\u0628\u0642\u0629\" \u0648\u062D\u0627\u0648\u0644 \u0625\u0646\u062A\u0627\u062C \u0647\u0630\u0627 \u0627\u0644\u062A\u0631\u062F\u062F. \u062F\u0646\u062F\u0646\u060C \u0635\u0641\u0651\u0631\u060C \u063A\u0646\u0651\u0650\u060C \u0623\u0648 \u0627\u0637\u0631\u0642 \u0634\u064A\u0626\u064B\u0627 \u0642\u0631\u064A\u0628\u064B\u0627.",
        step4:
          "4. \u064A\u0639\u0631\u0636 \u0627\u0644\u0645\u0648\u0627\u0644\u0641 \u0645\u062F\u0649 \u0642\u0631\u0628\u0643. \u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0627\u0644\u062A\u0631\u062F\u062F \u0636\u0645\u0646 5% \u0645\u0646 \u0627\u0644\u0647\u062F\u0641 \u0644\u0645\u062F\u0629 1.5 \u062B\u0627\u0646\u064A\u0629 \u0644\u0644\u0645\u0637\u0627\u0628\u0642\u0629!",
        step5:
          "5. \u062A\u0635\u0641\u062D \u0643\u062A\u0627\u0644\u0648\u062C \u0627\u0644\u0623\u0635\u0648\u0627\u062A \u0644\u0644\u062A\u0639\u0631\u0641 \u0639\u0644\u0649 \u0643\u0644 \u062C\u0633\u0645 \u0648\u0627\u0633\u062A\u0643\u0634\u0627\u0641 \u0643\u064A\u0641 \u064A\u0624\u062B\u0631 \u062A\u063A\u064A\u064A\u0631 \u062E\u0635\u0627\u0626\u0635\u0647 \u0639\u0644\u0649 \u062A\u0631\u062F\u062F\u0647.",
        readyBtn: "\u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u0644\u0639\u0628!",
      },
    },
  },
};

// ── API ──

/**
 * Initialize the locale from stored preference or browser language.
 * Sets document dir and lang attributes.
 * Call once at app startup before rendering.
 */
export function initLocale() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) {
    currentLocale = stored;
  } else {
    const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
    currentLocale = SUPPORTED.includes(browserLang) ? browserLang : "en";
  }

  document.documentElement.lang = currentLocale;
  document.documentElement.dir = isRTL() ? "rtl" : "ltr";
}

/**
 * Look up a translation by dot-path key.
 * Falls back to English, then returns the key itself.
 */
export function t(key) {
  const parts = key.split(".");

  let val = translations[currentLocale];
  for (const p of parts) {
    if (val && typeof val === "object" && p in val) {
      val = val[p];
    } else {
      val = undefined;
      break;
    }
  }

  if (typeof val === "string") return val;

  // Fallback to English
  if (currentLocale !== "en") {
    let fallback = translations.en;
    for (const p of parts) {
      if (fallback && typeof fallback === "object" && p in fallback) {
        fallback = fallback[p];
      } else {
        return key;
      }
    }
    if (typeof fallback === "string") return fallback;
  }

  return key;
}

/**
 * Get the current locale string.
 */
export function getLocale() {
  return currentLocale;
}

/**
 * Set locale, store preference, and update document attributes.
 */
export function setLocale(locale) {
  if (!SUPPORTED.includes(locale)) return;
  currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = isRTL() ? "rtl" : "ltr";
}

/**
 * Whether the current locale uses RTL direction.
 */
export function isRTL() {
  return RTL_LOCALES.includes(currentLocale);
}
