import React, { useState, useEffect, useMemo } from "react";
import { supabase, hashPassword } from "./supabaseClient";

/* ============================================================
   EL RECETARIO DE LA ABUELA — Web App (v2, con iconos)
   - Login con email + contraseña (vos generás las credenciales)
   - Panel admin oculto para agregar compradores
   - Contenido completo: 70 remedios en 8 categorías
   - Icono por categoría y por receta (Tabler Icons)
   ============================================================ */

const ADMIN_KEY = "abuela-admin-2026";

const CAT_ICON = {
  prevencion: "ti-shield-check",
  tos: "ti-wind",
  congestion: "ti-droplet",
  garganta: "ti-microphone-2",
  fiebre: "ti-thermometer",
  cuerpo: "ti-activity",
  cabeza: "ti-brain",
  recuperacion: "ti-heart",
};

function getItemIcon(name) {
  const n = name.toLowerCase();
  if (n.includes("baño")) return "ti-bath";
  if (n.includes("vaho") || n.includes("vapor")) return "ti-cloud";
  if (n.includes("gárgara")) return "ti-glass";
  if (n.includes("compresa") || n.includes("paño")) return "ti-first-aid-kit";
  if (n.includes("masaje")) return "ti-hand-stop";
  if (n.includes("batido")) return "ti-blender";
  if (n.includes("caldo")) return "ti-soup";
  if (n.includes("shot") || n.includes("tónico")) return "ti-flask-2";
  if (n.includes("ensalada")) return "ti-apple";
  if (n.includes("yogur")) return "ti-bowl";
  if (n.includes("sol")) return "ti-sun";
  if (n.includes("sueño") || n.includes("descanso")) return "ti-moon";
  if (n.includes("hidratación")) return "ti-glass-full";
  if (n.includes("ventilación")) return "ti-wind";
  if (n.includes("actividad física") || n.includes("estiramiento") || n.includes("retorno")) return "ti-walk";
  if (n.includes("chequeo") || n.includes("señales")) return "ti-alert-triangle";
  if (n.includes("lavado nasal")) return "ti-droplet-half-2";
  if (n.includes("jarabe") || n.includes("miel") || n.includes("almíbar") || n.includes("caramelo")) return "ti-droplet";
  if (n.includes("infusión") || n.includes("té ") || n.includes("agua de")) return "ti-cup";
  return "ti-leaf";
}

const DATA = [
  {
    id: "prevencion",
    label: "Prevención",
    desc: "Para fortalecer las defensas antes de enfermarte",
    items: [
      { n: "Infusión de jengibre y limón", ing: ["2cm jengibre fresco", "jugo de 1/2 limón", "1 taza agua", "miel a gusto"], prep: "Hervir el jengibre en rodajas 5 min. Colar, agregar limón y miel tibia.", cuando: "1 taza por día, a la mañana." },
      { n: "Tónico de saúco", ing: ["2 cdas flores de saúco secas", "1 taza agua"], prep: "Hervir el agua, apagar, agregar el saúco. Reposar 10 min tapado.", cuando: "1 taza al día en cambios de clima.", warn: "No en niños pequeños sin consultar." },
      { n: "Shot de cúrcuma, limón y pimienta", ing: ["1 cdita cúrcuma", "jugo de 1 limón", "pizca de pimienta negra", "1/2 vaso agua tibia"], prep: "Mezclar todo hasta disolver. Tomar de un trago.", cuando: "En ayunas, 3-4 veces por semana." },
      { n: "Infusión de equinácea", ing: ["1 cdita raíz de equinácea", "1 taza agua"], prep: "Hervir, agregar la equinácea, reposar 10 min.", cuando: "Ciclos de 7-10 días, no continuo.", warn: "Evitar con enfermedades autoinmunes." },
      { n: "Agua de ajo en ayunas", ing: ["1 diente de ajo", "1 vaso agua tibia"], prep: "Machacar el ajo, reposar 10 min en el agua.", cuando: "En ayunas, 2-3 veces por semana." },
      { n: "Batido de naranja, zanahoria y jengibre", ing: ["2 naranjas", "1 zanahoria", "1cm jengibre"], prep: "Licuar todo con agua o hielo.", cuando: "Como desayuno, 2-3 veces por semana." },
      { n: "Infusión de tomillo", ing: ["1 cdita tomillo seco", "1 taza agua"], prep: "Hervir, apagar, agregar tomillo. Reposar 8 min. Colar.", cuando: "1 taza al día en temporada fría." },
      { n: "Miel con propóleo", ing: ["1 cdita miel", "5 gotas propóleo en tintura"], prep: "Mezclar ambos ingredientes.", cuando: "1 vez al día.", warn: "No en alérgicos a productos de colmena." },
      { n: "Caldo de huesos casero", ing: ["huesos de pollo o vaca", "cebolla, ajo, apio, zanahoria", "sal y laurel"], prep: "Hervir a fuego bajo 3-4 horas. Colar.", cuando: "1 taza cada 2-3 días.", tip: "Se puede congelar en porciones." },
      { n: "Infusión de eucalipto (dosis baja)", ing: ["3-4 hojas de eucalipto", "1 taza agua"], prep: "Hervir 3 min. Colar.", cuando: "1 taza cada 2-3 días.", warn: "No en embarazadas ni menores de 6 años." },
      { n: "Vinagre de manzana con miel", ing: ["1 cda vinagre de manzana", "1 cdita miel", "1 vaso agua tibia"], prep: "Disolver ambos en el agua.", cuando: "En ayunas, 3 veces por semana." },
      { n: "Exposición solar consciente", ing: [], prep: "15-20 min de sol diario, antes de las 11 o después de las 16, sin protector en brazos y piernas.", cuando: "Hábito diario." },
      { n: "Rutina de sueño reparador", ing: [], prep: "Horarios regulares, 7-8 horas, sin pantallas 30 min antes, ambiente oscuro y fresco.", cuando: "Hábito diario." },
      { n: "Infusión de jengibre, cúrcuma y canela", ing: ["1cm jengibre", "1/2 cdita cúrcuma", "1 rama canela", "1 taza agua"], prep: "Hervir todo junto 5 min. Colar.", cuando: "1 taza al día en invierno." },
      { n: "Hidratación consciente", ing: [], prep: "Tomar 1.5-2 litros de agua por día, incluyendo infusiones y caldos.", cuando: "Hábito diario." },
    ],
  },
  {
    id: "tos",
    label: "Tos",
    desc: "Para la tos seca y con flema",
    items: [
      { n: "Jarabe casero de miel y limón", ing: ["3 cdas miel", "jugo de 2 limones"], prep: "Mezclar bien. Guardar en frasco de vidrio.", cuando: "1 cdita cada 3-4 horas.", warn: "No dar miel a menores de 1 año." },
      { n: "Jarabe de cebolla y miel", ing: ["1 cebolla grande", "3 cdas miel"], prep: "Alternar rodajas con miel en un frasco, reposar 8-12 hs. Colar el líquido.", cuando: "1 cdita cada 4 horas." },
      { n: "Infusión de tomillo y miel", ing: ["1 cdita tomillo seco", "1 taza agua", "1 cdita miel"], prep: "Hervir el tomillo 8 min. Colar, agregar miel tibia.", cuando: "2-3 tazas al día." },
      { n: "Vahos de eucalipto", ing: ["hojas de eucalipto o 5 gotas de aceite esencial", "bowl con agua caliente"], prep: "Inhalar el vapor cubriéndose la cabeza con una toalla, a distancia segura.", cuando: "1-2 veces al día, 5-10 min.", warn: "No apto para niños ni asmáticos sin consulta." },
      { n: "Té de jengibre con pimienta", ing: ["1cm jengibre", "pizca de pimienta negra", "1 taza agua", "miel"], prep: "Hervir el jengibre 5 min, agregar pimienta al final. Colar y endulzar.", cuando: "2 veces al día.", tip: "Ayuda a aflojar la flema." },
      { n: "Jarabe de rábano negro", ing: ["1 rábano negro", "3 cdas miel o azúcar"], prep: "Alternar rodajas con miel en frasco, reposar toda la noche. Colar.", cuando: "1 cdita cada 4-6 horas." },
      { n: "Gárgaras de agua tibia con sal", ing: ["1 vaso agua tibia", "1/2 cdita sal"], prep: "Disolver la sal en el agua tibia.", cuando: "Gárgaras 2-3 veces al día, sin tragar." },
      { n: "Infusión de malva", ing: ["1 cdita hojas de malva", "1 taza agua"], prep: "Hervir, apagar, agregar malva. Reposar 10 min.", cuando: "2 tazas al día." },
      { n: "Almíbar de tomillo y limón", ing: ["1 cdita tomillo", "jugo de 1 limón", "2 cdas miel", "1/2 taza agua"], prep: "Hervir el tomillo 5 min. Colar, agregar limón y miel tibia.", cuando: "1 cdita 3 veces al día." },
      { n: "Humidificación del ambiente", ing: [], prep: "Recipiente con agua cerca de una fuente de calor, o humidificador, sobre todo al dormir.", cuando: "Hábito nocturno." },
    ],
  },
  {
    id: "congestion",
    label: "Congestión",
    desc: "Congestión nasal y mocos",
    items: [
      { n: "Vahos de manzanilla", ing: ["2 cdas flores de manzanilla", "bowl con agua caliente"], prep: "Inhalar el vapor con una toalla cubriendo la cabeza.", cuando: "1-2 veces al día." },
      { n: "Lavado nasal con solución salina", ing: ["1 taza agua tibia hervida", "1/2 cdita sal"], prep: "Disolver la sal. Usar con jeringa sin aguja o dispositivo de lavado nasal.", cuando: "1-2 veces al día.", tip: "Siempre agua hervida y enfriada." },
      { n: "Infusión de eucalipto", ing: ["3-4 hojas de eucalipto", "1 taza agua"], prep: "Hervir 5 min. Colar.", cuando: "1-2 tazas al día." },
      { n: "Compresas tibias en senos nasales", ing: ["paño limpio", "agua tibia"], prep: "Humedecer, escurrir, aplicar sobre nariz y frente.", cuando: "2-3 veces al día, 5-10 min." },
      { n: "Té de jengibre y ajo", ing: ["1cm jengibre", "1 diente de ajo", "1 taza agua"], prep: "Hervir ambos 5 min. Colar.", cuando: "1 taza al día." },
      { n: "Elevar la cabeza al dormir", ing: [], prep: "Dormir con una almohada extra.", cuando: "Hábito nocturno." },
      { n: "Vapor de agua con romero", ing: ["romero fresco o seco", "bowl con agua caliente"], prep: "Inhalar el vapor.", cuando: "1 vez al día." },
      { n: "Aceite de sésamo tibio (uso nasal)", ing: ["gotas de aceite de sésamo tibio"], prep: "Entibiar levemente. Aplicar con hisopo en la entrada de las fosas nasales.", cuando: "1 vez al día, antes de dormir.", warn: "No introducir el hisopo profundamente." },
    ],
  },
  {
    id: "garganta",
    label: "Garganta",
    desc: "Dolor e irritación de garganta",
    items: [
      { n: "Gárgaras de sal y bicarbonato", ing: ["1 vaso agua tibia", "1/2 cdita sal", "1/4 cdita bicarbonato"], prep: "Disolver ambos en el agua.", cuando: "Gárgaras 2-3 veces al día." },
      { n: "Té de manzanilla con miel y limón", ing: ["1 cdita manzanilla", "1 taza agua", "miel y limón"], prep: "Hervir, apagar, agregar manzanilla. Reposar 8 min. Colar y endulzar.", cuando: "2-3 tazas al día." },
      { n: "Jengibre masticado con sal", ing: ["rodaja fina de jengibre", "pizca de sal"], prep: "Colocar sal sobre el jengibre.", cuando: "Masticar lento, dejando que el jugo bañe la garganta." },
      { n: "Infusión de salvia", ing: ["1 cdita salvia seca", "1 taza agua"], prep: "Hervir, apagar, agregar salvia. Reposar 10 min.", cuando: "Infusión o gárgaras, 2 veces al día.", warn: "Cantidades moderadas en embarazo." },
      { n: "Miel con canela", ing: ["1 cdita miel", "1/4 cdita canela"], prep: "Mezclar bien.", cuando: "1-2 veces al día." },
      { n: "Caramelos caseros de jengibre y miel", ing: ["2 cdas jengibre rallado", "3 cdas miel", "jugo de 1/2 limón"], prep: "Cocinar a fuego bajo hasta espesar. Enfriar en porciones.", cuando: "Chupar 1 porción cuando aparece el dolor." },
      { n: "Infusión de regaliz", ing: ["1 cdita raíz de regaliz", "1 taza agua"], prep: "Hervir 5 min. Colar.", cuando: "1 taza al día, períodos cortos.", warn: "Evitar con hipertensión." },
      { n: "Compresa tibia en el cuello", ing: ["paño limpio", "agua tibia"], prep: "Humedecer, escurrir, colocar en el cuello.", cuando: "10-15 min, 1-2 veces al día." },
    ],
  },
  {
    id: "fiebre",
    label: "Fiebre",
    desc: "Cuidados naturales para la fiebre",
    items: [
      { n: "Paños tibios en frente y muñecas", ing: ["paños limpios", "agua tibia (no fría)"], prep: "Humedecer y aplicar en frente, cuello y muñecas.", cuando: "Renovar cada 15-20 min.", tip: "El agua fría genera escalofríos, mejor tibia." },
      { n: "Hidratación con sales naturales", ing: ["1 litro agua", "jugo de 1 limón", "1 cdita miel", "pizca de sal"], prep: "Mezclar todo.", cuando: "En sorbos frecuentes durante el día." },
      { n: "Infusión de flor de saúco", ing: ["1 cdita flores de saúco", "1 taza agua"], prep: "Hervir, apagar, agregar saúco. Reposar 10 min.", cuando: "2-3 tazas mientras dure la fiebre." },
      { n: "Baño tibio de esponja", ing: [], prep: "Pasar una esponja con agua tibia por brazos, piernas y torso.", cuando: "Según necesidad.", warn: "Nunca agua fría o hielo directo." },
      { n: "Reposo en ambiente ventilado", ing: [], prep: "Descansar en ambiente fresco, con ropa liviana.", cuando: "Hábito durante la fiebre." },
      { n: "Caldo de verduras liviano", ing: ["zanahoria, apio, cebolla, zapallo", "agua y sal"], prep: "Hervir las verduras 30-40 min.", cuando: "Durante los días de fiebre.", warn: "Si supera 39°C, dura más de 3 días, o es en niños pequeños: consultar a un médico." },
    ],
  },
  {
    id: "cuerpo",
    label: "Dolor de cuerpo",
    desc: "Malestar general y dolor muscular",
    items: [
      { n: "Baño tibio con sales de Epsom", ing: ["2 tazas sales de Epsom", "agua tibia"], prep: "Disolver las sales en la bañera o palangana.", cuando: "15-20 min, antes de dormir." },
      { n: "Infusión de manzanilla y lavanda", ing: ["1 cdita manzanilla", "1 cdita lavanda", "1 taza agua"], prep: "Hervir, apagar, agregar ambas. Reposar 8-10 min.", cuando: "1-2 tazas al día." },
      { n: "Masaje con aceite de oliva tibio", ing: ["aceite de oliva", "opcional: gotas de lavanda"], prep: "Entibiar levemente. Masajear piernas, brazos y espalda.", cuando: "Según necesidad." },
      { n: "Té de jengibre y cúrcuma", ing: ["1cm jengibre", "1/2 cdita cúrcuma", "1 taza agua", "miel"], prep: "Hervir 5 min. Colar y endulzar.", cuando: "1-2 tazas al día." },
      { n: "Compresas tibias en articulaciones", ing: ["paños limpios", "agua tibia"], prep: "Aplicar en rodillas, espalda baja u hombros.", cuando: "10-15 min, 1-2 veces al día." },
      { n: "Descanso activo y estiramientos suaves", ing: [], prep: "Estiramientos suaves de cuello, brazos y piernas sin forzar.", cuando: "Hábito." },
    ],
  },
  {
    id: "cabeza",
    label: "Dolor de cabeza",
    desc: "Asociado al resfrío",
    items: [
      { n: "Infusión de menta", ing: ["1 cdita hojas de menta", "1 taza agua"], prep: "Hervir, apagar, agregar menta. Reposar 8 min.", cuando: "1-2 tazas al día." },
      { n: "Compresa fría en la frente", ing: ["paño limpio", "agua fría"], prep: "Humedecer en agua fría, escurrir, aplicar en la frente.", cuando: "10-15 min, si el dolor es intenso." },
      { n: "Masaje con aceite de menta en sienes", ing: ["gotas de aceite esencial de menta", "aceite base"], prep: "Diluir 2-3 gotas en 1 cdita de aceite base. Masajear sienes y nuca.", cuando: "Según necesidad.", warn: "Nunca aplicar el aceite esencial puro." },
      { n: "Hidratación abundante", ing: [], prep: "Aumentar el consumo de agua e infusiones.", cuando: "Durante todo el día." },
      { n: "Infusión de jengibre", ing: ["1cm jengibre", "1 taza agua"], prep: "Hervir 5 min. Colar.", cuando: "1 taza cuando aparece el dolor." },
      { n: "Descanso en ambiente oscuro y silencioso", ing: [], prep: "Recostarse en habitación con poca luz, sin ruidos, 20-30 min.", cuando: "Según necesidad." },
      { n: "Té de manzanilla y jengibre", ing: ["1 cdita manzanilla", "1cm jengibre", "1 taza agua"], prep: "Hervir el jengibre 5 min, agregar manzanilla, reposar 5 min más.", cuando: "1-2 tazas al día.", warn: "Si el dolor es muy intenso o hay otros síntomas de alarma, consultar a un médico." },
    ],
  },
  {
    id: "recuperacion",
    label: "Recuperación",
    desc: "Para recuperar energía después de la gripe",
    items: [
      { n: "Batido de banana, avena y canela", ing: ["1 banana", "3 cdas avena", "1 taza leche o bebida vegetal", "canela"], prep: "Licuar todo.", cuando: "Desayuno o merienda." },
      { n: "Infusión de jengibre y menta", ing: ["1cm jengibre", "hojas de menta", "1 taza agua"], prep: "Hervir jengibre 5 min, agregar menta, reposar 3 min.", cuando: "1-2 tazas al día, primera semana." },
      { n: "Ensalada de frutas cítricas", ing: ["naranja, mandarina, kiwi, pomelo"], prep: "Cortar y mezclar.", cuando: "Colación, varias veces por semana." },
      { n: "Caldo de pollo con vegetales", ing: ["pollo", "zanahoria, apio, cebolla", "sal y hierbas"], prep: "Hervir a fuego bajo 1-2 horas.", cuando: "1 vez al día, primeros días." },
      { n: "Infusión de hinojo", ing: ["1 cdita semillas de hinojo", "1 taza agua"], prep: "Hervir 5 min. Colar.", cuando: "Después de las comidas." },
      { n: "Retorno gradual a la actividad física", ing: [], prep: "Caminatas cortas de 10-15 min antes de ejercicio intenso.", cuando: "Hábito." },
      { n: "Yogur con frutos secos y miel", ing: ["1 pote yogur natural", "frutos secos", "1 cdita miel"], prep: "Mezclar todo.", cuando: "Desayuno o merienda." },
      { n: "Infusión de boldo", ing: ["1 cdita boldo seco", "1 taza agua"], prep: "Hervir, apagar, agregar boldo. Reposar 8 min.", cuando: "Después de comidas, pocos días.", warn: "No en exceso, evitar en embarazo." },
      { n: "Ventilación y luz natural del ambiente", ing: [], prep: "Ventilar los ambientes y exponerse a luz natural.", cuando: "Hábito diario." },
      { n: "Chequeo de señales de recaída", ing: [], prep: "Observar: fiebre que reaparece, tos que empeora, dificultad para respirar, malestar más de 10-14 días.", cuando: "Si aparece algo de esto, consultar a un médico." },
    ],
  },
];

const TOTAL_ITEMS = DATA.reduce((a, c) => a + c.items.length, 0);

function useBrandAssets() {
  useEffect(() => {
    const addLink = (id, href) => {
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    };
    addLink("rda-font-link", "https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600&display=swap");
    addLink("rda-icon-link", "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2/dist/tabler-icons.min.css");
  }, []);
}

const colors = {
  cream: "#F7F1E3",
  creamDeep: "#EDE3CB",
  ink: "#2E3620",
  inkSoft: "#5C6248",
  olive: "#5C7238",
  oliveDark: "#46592A",
  oliveWash: "#EAF0DE",
  terracotta: "#C0603A",
  terracottaDeep: "#9C4B2D",
  terracottaWash: "#FBEEE6",
  line: "#E1D6B8",
  card: "#FFFDF8",
};

function Icon({ name, size = 16, color = colors.ink }) {
  return <i className={`ti ${name}`} style={{ fontSize: size, color, lineHeight: 1 }} aria-hidden="true" />;
}

function IconBadge({ name, size = 32, iconSize = 16, bg = colors.terracottaWash, color = colors.terracottaDeep, radius = 9 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={name} size={iconSize} color={color} />
    </div>
  );
}

function Logo({ compact }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
      <IconBadge name="ti-cup" size={compact ? 32 : 30} iconSize={compact ? 16 : 15} bg={colors.oliveWash} color={colors.oliveDark} radius={9} />
      <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: compact ? 14.5 : 14, color: colors.ink, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {compact ? "El Recetario de la Abuela" : "El Recetario de la Abuela"}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onGoAdmin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clicks, setClicks] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const passHash = await hashPassword(password);
      const { data, error: dbError } = await supabase
        .from("compradores")
        .select("password_hash")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (dbError) throw dbError;

      if (data && data.password_hash === passHash) {
        onLogin(cleanEmail);
      } else {
        setError("Email o contraseña incorrectos.");
      }
    } catch (err) {
      setError("Email o contraseña incorrectos.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: 480, background: colors.cream }}>
      <div style={{ padding: "44px 24px 8px", textAlign: "center", background: colors.oliveWash }} onClick={() => setClicks((c) => c + 1)}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: colors.card, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px -6px rgba(46,54,32,0.25)" }}>
          <Icon name="ti-cup" size={26} color={colors.terracottaDeep} />
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, color: colors.ink, marginBottom: 6 }}>El Recetario<br />de la Abuela</div>
        <div style={{ fontSize: 12.5, color: colors.inkSoft, paddingBottom: 24 }}>70+ remedios naturales para gripes y defensas</div>
      </div>

      <div style={{ padding: "24px 24px 40px", maxWidth: 380, margin: "0 auto" }}>
        <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 18, padding: "26px" }}>
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 19, margin: "0 0 6px", color: colors.ink }}>
            Ingresá a tu recetario
          </h1>
          <p style={{ fontSize: 13, color: colors.inkSoft, margin: "0 0 20px", lineHeight: 1.5 }}>
            Usá el email y la contraseña que recibiste por correo tras tu compra.
          </p>

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: 12, color: colors.inkSoft, display: "block", marginBottom: 5 }}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" style={inputStyle} />
            <label style={{ fontSize: 12, color: colors.inkSoft, display: "block", margin: "14px 0 5px" }}>Contraseña</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />

            {error && <p style={{ color: colors.terracottaDeep, fontSize: 12.5, margin: "12px 0 0" }}>{error}</p>}

            <button type="submit" disabled={loading} style={btnStyle}>
              <Icon name="ti-lock-open" size={16} color="#FFFFFF" />
              <span>{loading ? "Verificando..." : "Ingresar"}</span>
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 11.5, color: "#A39A7E", marginTop: 22, lineHeight: 1.6 }}>
          ¿No recibiste tus datos de acceso? Escribinos y te los reenviamos.
        </p>

        {clicks >= 5 && (
          <button onClick={onGoAdmin} style={{ display: "block", margin: "10px auto 0", background: "none", border: "none", color: colors.inkSoft, fontSize: 11, textDecoration: "underline", cursor: "pointer" }}>
            Acceso administrador
          </button>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 10,
  border: `1px solid ${colors.line}`,
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  background: "#fff",
  color: colors.ink,
  outline: "none",
  boxSizing: "border-box",
};

const btnStyle = {
  width: "100%",
  marginTop: 20,
  padding: "13px",
  borderRadius: 11,
  border: "none",
  background: colors.olive,
  color: "#FFFFFF",
  fontSize: 14.5,
  fontWeight: 600,
  fontFamily: "Inter, sans-serif",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

function AdminScreen({ onBack }) {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [list, setList] = useState([]);

  const loadList = async () => {
    try {
      const { data, error } = await supabase
        .from("compradores")
        .select("email")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setList(data ? data.map((r) => r.email) : []);
    } catch (e) {
      setList([]);
    }
  };

  useEffect(() => {
    if (unlocked) loadList();
  }, [unlocked]);

  const checkKey = (e) => {
    e.preventDefault();
    if (key === ADMIN_KEY) setUnlocked(true);
    else setMsg("Clave incorrecta.");
  };

  const addUser = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const cleanEmail = email.trim().toLowerCase();
      const passHash = await hashPassword(password);
      const { error } = await supabase
        .from("compradores")
        .upsert({ email: cleanEmail, password_hash: passHash });
      if (error) throw error;
      setMsg(`Usuario ${cleanEmail} creado correctamente.`);
      setEmail("");
      setPassword("");
      loadList();
    } catch (err) {
      setMsg("Error al crear el usuario, intentá de nuevo.");
    }
  };

  if (!unlocked) {
    return (
      <div style={{ minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", background: colors.cream, padding: 20 }}>
        <form onSubmit={checkKey} style={{ width: "100%", maxWidth: 320, background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <IconBadge name="ti-lock" size={30} iconSize={15} bg={colors.oliveWash} color={colors.oliveDark} />
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 16, margin: 0, color: colors.ink }}>Panel administrador</h2>
          </div>
          <input type="password" placeholder="Clave de administrador" value={key} onChange={(e) => setKey(e.target.value)} style={inputStyle} />
          {msg && <p style={{ color: colors.terracottaDeep, fontSize: 12, marginTop: 10 }}>{msg}</p>}
          <button type="submit" style={btnStyle}><Icon name="ti-key" size={15} color="#FFFFFF" /><span>Entrar</span></button>
          <button type="button" onClick={onBack} style={{ ...btnStyle, background: colors.card, color: colors.inkSoft, border: `1px solid ${colors.line}`, marginTop: 10 }}>Volver</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 480, background: colors.cream, padding: "40px 20px" }}>
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <IconBadge name="ti-user-plus" size={30} iconSize={15} bg={colors.terracottaWash} color={colors.terracottaDeep} />
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 19, margin: 0, color: colors.ink }}>Agregar compradora/comprador</h2>
        </div>
        <p style={{ fontSize: 13, color: colors.inkSoft, margin: "0 0 20px" }}>
          Generá un email y contraseña para cada persona que compró, y envíaselo por mail.
        </p>

        <form onSubmit={addUser} style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 16, padding: 22 }}>
          <label style={{ fontSize: 12, color: colors.inkSoft }}>Email del comprador</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle, marginTop: 5, marginBottom: 14 }} placeholder="cliente@email.com" />
          <label style={{ fontSize: 12, color: colors.inkSoft }}>Contraseña a asignar</label>
          <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, marginTop: 5 }} placeholder="Ej: abuela4821" />
          <button type="submit" style={btnStyle}><Icon name="ti-circle-plus" size={15} color="#FFFFFF" /><span>Crear acceso</span></button>
          {msg && <p style={{ fontSize: 12.5, color: colors.oliveDark, marginTop: 12 }}>{msg}</p>}
        </form>

        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 12, color: colors.inkSoft, marginBottom: 8 }}>{list.length} accesos creados</p>
          <div style={{ maxHeight: 160, overflowY: "auto", background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 12, padding: 10 }}>
            {list.map((k) => (
              <div key={k} style={{ fontSize: 12, color: colors.ink, padding: "4px 6px", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="ti-user" size={13} color={colors.inkSoft} />
                {k}
              </div>
            ))}
          </div>
        </div>

        <button onClick={onBack} style={{ ...btnStyle, background: colors.card, color: colors.inkSoft, border: `1px solid ${colors.line}`, marginTop: 18 }}>Volver al inicio</button>
      </div>
    </div>
  );
}

function RemedyCard({ item, catId, onOpen, isFavorite, onToggleFavorite }) {
  return (
    <button
      onClick={() => onOpen(item)}
      style={{ textAlign: "left", background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 14, padding: "14px 14px", cursor: "pointer", width: "100%", display: "flex", alignItems: "center", gap: 12, minHeight: 64 }}
    >
      <IconBadge name={getItemIcon(item.n)} size={38} iconSize={19} radius={11} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 14.5, fontWeight: 600, color: colors.ink, marginBottom: 4, lineHeight: 1.3 }}>{item.n}</div>
        <div style={{ fontSize: 12, color: colors.inkSoft, display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="ti-clock" size={12} color={colors.inkSoft} />
          <span>{item.cuando}</span>
        </div>
      </div>
      {onToggleFavorite && (
        <div
          role="button"
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.n); }}
          style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}
        >
          <Icon name={isFavorite ? "ti-star-filled" : "ti-star"} size={19} color={isFavorite ? colors.terracotta : colors.line} />
        </div>
      )}
      <Icon name="ti-chevron-right" size={17} color={colors.line} />
    </button>
  );
}

function RemedyDetail({ item, onClose }) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(46,54,32,0.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 1000,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.cream,
          borderRadius: "20px 20px 0 0",
          padding: "22px 22px calc(22px + env(safe-area-inset-bottom, 0px))",
          maxWidth: 460,
          width: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: colors.line, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <IconBadge name={getItemIcon(item.n)} size={38} iconSize={19} radius={11} />
            <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 19, margin: "10px 0 0", color: colors.ink, lineHeight: 1.3 }}>{item.n}</h3>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Icon name="ti-x" size={18} color={colors.inkSoft} />
          </button>
        </div>

        {item.ing && item.ing.length > 0 && (
          <div style={{ margin: "16px 0 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 600, color: colors.terracottaDeep, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <Icon name="ti-list" size={13} color={colors.terracottaDeep} /><span>Ingredientes</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: colors.ink, lineHeight: 1.7 }}>
              {item.ing.map((i, idx) => <li key={idx}>{i}</li>)}
            </ul>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 600, color: colors.terracottaDeep, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <Icon name="ti-flask" size={13} color={colors.terracottaDeep} /><span>Preparación</span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: colors.ink, lineHeight: 1.6 }}>{item.prep}</p>
        </div>

        <div style={{ background: colors.oliveWash, borderRadius: 11, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: item.tip || item.warn ? 12 : 0 }}>
          <Icon name="ti-clock" size={15} color={colors.oliveDark} />
          <p style={{ margin: 0, fontSize: 12.5, color: colors.oliveDark, lineHeight: 1.5 }}>{item.cuando}</p>
        </div>

        {item.tip && (
          <p style={{ fontSize: 12.5, color: colors.oliveDark, background: "#EEF2E4", padding: "10px 12px", borderRadius: 10, margin: "0 0 10px", display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Icon name="ti-bulb" size={15} color={colors.oliveDark} /><span>{item.tip}</span>
          </p>
        )}
        {item.warn && (
          <p style={{ fontSize: 12.5, color: colors.terracottaDeep, background: colors.terracottaWash, padding: "10px 12px", borderRadius: 10, margin: 0, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Icon name="ti-alert-triangle" size={15} color={colors.terracottaDeep} /><span>{item.warn}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function MainApp({ onLogout, userEmail }) {
  const [activeCat, setActiveCat] = useState(DATA[0].id);
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    let active = true;
    async function loadFavorites() {
      try {
        const { data, error } = await supabase
          .from("favoritos")
          .select("item_name")
          .eq("email", userEmail);
        if (error) throw error;
        if (active) setFavorites(new Set((data || []).map((r) => r.item_name)));
      } catch (e) {
        // Si falla (por ejemplo la tabla no existe todavía), seguimos sin favoritos.
      }
    }
    if (userEmail) loadFavorites();
    return () => { active = false; };
  }, [userEmail]);

  const toggleFavorite = async (itemName) => {
    const isFav = favorites.has(itemName);
    const next = new Set(favorites);
    if (isFav) next.delete(itemName); else next.add(itemName);
    setFavorites(next);
    try {
      if (isFav) {
        await supabase.from("favoritos").delete().eq("email", userEmail).eq("item_name", itemName);
      } else {
        await supabase.from("favoritos").upsert({ email: userEmail, item_name: itemName });
      }
    } catch (e) {
      // Si falla el guardado remoto, el cambio local ya se ve; no bloqueamos la UI.
    }
  };

  const results = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    const found = [];
    DATA.forEach((cat) => {
      cat.items.forEach((it) => {
        if (it.n.toLowerCase().includes(q)) found.push({ ...it, catId: cat.id });
      });
    });
    return found;
  }, [search]);

  const activeCategory = DATA.find((c) => c.id === activeCat);
  const favoriteItems = useMemo(() => {
    const found = [];
    DATA.forEach((cat) => {
      cat.items.forEach((it) => {
        if (favorites.has(it.n)) found.push({ item: it, catId: cat.id });
      });
    });
    return found;
  }, [favorites]);

  return (
    <div style={{ background: colors.cream, minHeight: 500, paddingBottom: 40 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: colors.card, borderBottom: `1px solid ${colors.line}` }}>
        <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <Logo compact />
          <button onClick={onLogout} aria-label="Cerrar sesión" style={{ background: "none", border: `1px solid ${colors.line}`, borderRadius: 10, width: 38, height: 38, flexShrink: 0, color: colors.inkSoft, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="ti-logout" size={16} color={colors.inkSoft} />
          </button>
        </div>

        <div style={{ padding: "0 16px 12px", position: "relative" }}>
          <input
            type="text"
            placeholder={`Buscar entre ${TOTAL_ITEMS} remedios...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 38, paddingTop: 13, paddingBottom: 13, fontSize: 15 }}
          />
          <div style={{ position: "absolute", left: 29, top: 13 }}>
            <Icon name="ti-search" size={16} color={colors.inkSoft} />
          </div>
        </div>
      </div>

      {results ? (
        <div style={{ padding: "14px 16px" }}>
          <p style={{ fontSize: 12.5, color: colors.inkSoft, marginBottom: 12 }}>{results.length} resultados para "{search}"</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            {results.map((it, idx) => (
              <RemedyCard key={idx} item={it} catId={it.catId} onOpen={setOpenItem} isFavorite={favorites.has(it.n)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "14px 16px 6px", WebkitOverflowScrolling: "touch" }}>
            <button
              onClick={() => setActiveCat("favoritos")}
              style={{
                flexShrink: 0,
                padding: "10px 16px 10px 12px",
                minHeight: 40,
                borderRadius: 999,
                border: `1px solid ${activeCat === "favoritos" ? colors.oliveDark : colors.line}`,
                background: activeCat === "favoritos" ? colors.olive : "#fff",
                color: activeCat === "favoritos" ? "#FFFFFF" : colors.ink,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Icon name="ti-star-filled" size={15} color={activeCat === "favoritos" ? "#FFFFFF" : colors.terracotta} />
              <span>Favoritos · {favoriteItems.length}</span>
            </button>
            {DATA.map((cat) => {
              const active = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  style={{
                    flexShrink: 0,
                    padding: "10px 16px 10px 12px",
                    minHeight: 40,
                    borderRadius: 999,
                    border: `1px solid ${active ? colors.oliveDark : colors.line}`,
                    background: active ? colors.olive : "#fff",
                    color: active ? "#FFFFFF" : colors.ink,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <Icon name={CAT_ICON[cat.id]} size={15} color={active ? "#FFFFFF" : colors.terracottaDeep} />
                  <span>{cat.label} · {cat.items.length}</span>
                </button>
              );
            })}
          </div>

          {activeCat === "favoritos" ? (
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <IconBadge name="ti-star-filled" size={28} iconSize={15} bg={colors.terracottaWash} color={colors.terracotta} />
                <div>
                  <div style={{ fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 700, color: colors.ink }}>Tus favoritos</div>
                  <div style={{ fontSize: 12.5, color: colors.inkSoft }}>Los remedios que guardaste</div>
                </div>
              </div>
              {favoriteItems.length === 0 ? (
                <p style={{ fontSize: 13, color: colors.inkSoft, textAlign: "center", padding: "30px 20px", lineHeight: 1.6 }}>
                  Todavía no guardaste ningún remedio. Tocá la estrella en cualquier remedio para agregarlo acá.
                </p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                  {favoriteItems.map((o, idx) => (
                    <RemedyCard key={idx} item={o.item} catId={o.catId} onOpen={setOpenItem} isFavorite={true} onToggleFavorite={toggleFavorite} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <IconBadge name={CAT_ICON[activeCat]} size={28} iconSize={15} bg={colors.oliveWash} color={colors.oliveDark} />
                <div>
                  <div style={{ fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 700, color: colors.ink }}>{activeCategory.label}</div>
                  <div style={{ fontSize: 12.5, color: colors.inkSoft }}>{activeCategory.desc}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                {activeCategory.items.map((it, idx) => (
                  <RemedyCard key={idx} item={it} catId={activeCat} onOpen={setOpenItem} isFavorite={favorites.has(it.n)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {openItem && <RemedyDetail item={openItem} onClose={() => setOpenItem(null)} />}

      <p style={{ fontSize: 11, color: "#A39A7E", textAlign: "center", padding: "24px 20px 0", lineHeight: 1.6 }}>
        Estos remedios son de carácter complementario y tradicional. No reemplazan tratamientos médicos.
        Ante síntomas persistentes o graves, consultá a un médico.
      </p>
    </div>
  );
}

export default function App() {
  useBrandAssets();
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);

  if (screen === "admin") return <AdminScreen onBack={() => setScreen("login")} />;
  if (screen === "app" && user) return <MainApp userEmail={user} onLogout={() => { setUser(null); setScreen("login"); }} />;

  return (
    <LoginScreen
      onLogin={(email) => { setUser(email); setScreen("app"); }}
      onGoAdmin={() => setScreen("admin")}
    />
  );
}
