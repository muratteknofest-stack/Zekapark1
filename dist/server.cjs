var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  let aiClient = null;
  function getGeminiClient() {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new import_genai.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
      });
    }
    return aiClient;
  }
  app.post("/api/send-weekly-report", async (req, res) => {
    try {
      const { parentEmail, studentName, weeklyData } = req.body;
      if (!parentEmail) {
        return res.status(400).json({ error: "Parent email is required" });
      }
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ZekaPark Haftal\u0131k Geli\u015Fim \xD6zeti</h1>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <p style="font-size: 16px; line-height: 1.5;">Merhaba,</p>
            <p style="font-size: 16px; line-height: 1.5;">\xD6\u011Frencimiz <strong>${studentName}</strong>'\u0131n bu haftaki \xE7al\u0131\u015Fma performans\u0131 ba\u015Far\u0131yla analiz edildi:</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 24px 0;">
              <ul style="list-style-type: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 12px; font-size: 15px; display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">\u23F1\uFE0F Haftal\u0131k \xC7al\u0131\u015Fma S\xFCresi:</span>
                  <strong style="color: #0f172a;">${weeklyData?.totalMinutes || 0} dakika</strong>
                </li>
                <li style="margin-bottom: 12px; font-size: 15px; display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">\u{1F3AF} \xC7\xF6z\xFClen Toplam Soru:</span>
                  <strong style="color: #0f172a;">${weeklyData?.totalQuestions || 0} soru</strong>
                </li>
                <li style="margin-bottom: 12px; font-size: 15px; display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">\u2705 Do\u011Fru Oran\u0131:</span>
                  <strong style="color: #10b981;">%${weeklyData?.accuracy || 0}</strong>
                </li>
                <li style="font-size: 15px; display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">\u{1F525} G\xFCncel \xD6\u011Frenme Serisi:</span>
                  <strong style="color: #f59e0b;">${weeklyData?.streak || 0} g\xFCn</strong>
                </li>
              </ul>
            </div>
            
            <p style="font-size: 15px; color: #475569; line-height: 1.5;">Geli\u015Fim e\u011Frisini incelemek ve yapay zeka destekli detayl\u0131 analizlere ula\u015Fmak i\xE7in Veli Portal\u0131'n\u0131 ziyaret edebilirsiniz.</p>
            
            <div style="text-align: center; margin-top: 32px;">
              <a href="#" style="background-color: #4f46e5; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">Portala Giri\u015F Yap</a>
            </div>
          </div>
        </div>
      `;
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("Simulating weekly report email to:", parentEmail);
        return res.json({
          success: true,
          simulated: true,
          message: "E-posta sim\xFCle edildi (SMTP ayarlar\u0131 eksik).",
          preview: emailHtml
        });
      }
      const transporter = import_nodemailer.default.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.sendMail({
        from: '"ZekaPark Geli\u015Fim" <noreply@zekapark.com>',
        to: parentEmail,
        subject: `${studentName} - Haftal\u0131k ZekaPark Geli\u015Fim \xD6zeti`,
        html: emailHtml
      });
      res.json({ success: true, message: "Haftal\u0131k \xF6zet ba\u015Far\u0131yla g\xF6nderildi." });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ error: error.message || "E-posta g\xF6nderilemedi" });
    }
  });
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: Date.now()
    });
  });
  app.post("/api/ai-hint", async (req, res) => {
    try {
      const {
        questionId,
        questionType,
        category,
        difficulty,
        prompt,
        secondaryPrompt,
        explanation,
        options,
        correctOptionId,
        stepRequested = 1
      } = req.body;
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(200).json({
          fallback: true,
          message: "Gemini API key is not configured; using procedural Socratic engine."
        });
      }
      const promptContext = `
Sen B\u0130LSEM (Bilim ve Sanat Merkezleri) ve bili\u015Fsel yetenek s\u0131navlar\u0131na haz\u0131rlanan ilkokul \xF6\u011Frencileri (7-11 ya\u015F) i\xE7in \xF6zel tasarlanm\u0131\u015F \u015Fefkatli, e\u011Flenceli ve cesaret verici bir "Bili\u015Fsel Zeka ve Pedagoji Rehberisin".

\xD6\u011Frenci bir soru \xFCzerinde d\xFC\u015F\xFCn\xFCrken tak\u0131ld\u0131 ve "\u0130pucu" butonuna bast\u0131.
G\xD6REV\u0130N: \xC7ocu\u011Fa do\u011Frudan cevab\u0131 s\xF6ylemeden (KES\u0130NL\u0130KLE "Cevap A \u015F\u0131kk\u0131", "Do\u011Fru se\xE7enek C" gibi do\u011Frudan spoiler vermeden), Sokratik y\xF6ntemle kendi akl\u0131yla sonuca ula\u015Fmas\u0131n\u0131 sa\u011Flayacak 3 KADEMEL\u0130 ADIM ADIM \u0130PUCU seti \xFCretmektir.

Soru Bilgileri:
- Kategori: ${category}
- Soru Tipi: ${questionType}
- Zorluk Seviyesi: ${difficulty} / 6
- Soru Metni: "${prompt}" ${secondaryPrompt ? `(${secondaryPrompt})` : ""}
- Sorunun Mant\u0131k \xD6zeti ve \xC7\xF6z\xFCm Ad\u0131mlar\u0131: "${explanation?.summary || ""}" - "${explanation?.steps?.join(" | ") || ""}"
- Se\xE7enekler: ${JSON.stringify(options?.map((o) => ({ id: o.id, label: o.label })) || [])}
- Do\u011Fru Se\xE7enek: ${correctOptionId}

\xDCretece\u011Fin 3 Ad\u0131m \u015Eunlard\u0131r:
1. "focus" (Nereye Bakmal\u0131s\u0131n?): \xC7ocu\u011Fun dikkatini sorudaki anahtar b\xF6lgeye, de\u011Fi\u015Fen par\xE7aya veya eksene y\xF6nlendir.
2. "rule" (Gizli Kural\u0131 Ke\u015Ffet): \u015Eekiller aras\u0131ndaki ili\u015Fkiyi (d\xF6nme a\xE7\u0131s\u0131, sat\u0131r/s\xFCtun kural\u0131, simetri aynas\u0131, par\xE7a say\u0131s\u0131 vb.) merak uyand\u0131ran bir soruyla d\xFC\u015F\xFCnd\xFCr.
3. "elimination" (Se\xE7enekleri Ele): Hangi bariz se\xE7eneklerin neden elenebilece\u011Fini ve do\u011Fru cevab\u0131 ele veren kritik ayr\u0131nt\u0131y\u0131 f\u0131s\u0131lda (ama do\u011Frudan do\u011Fru se\xE7ene\u011Fin harfini s\xF6yleme).

\xDCslup Kurallar\u0131:
- Dil: \xC7ok samimi, sevimli, T\xFCrk\xE7e, \xE7ocuk dostu, motive edici ("Harika bir dedektifsin!", "Birlikte par\xE7alar\u0131 inceleyelim!").
- Uzunluk: Her ad\u0131m 2-3 k\u0131sa, net c\xFCmle olsun.
`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptContext,
        config: {
          systemInstruction: "Sen \xE7ocuklar i\xE7in bili\u015Fsel zeka sorular\u0131nda rehberlik eden pedagojik bir AI ko\xE7usun. \xC7ocu\u011Fa asla direkt cevab\u0131 s\xF6yleme; Sokratik ipu\xE7lar\u0131 ver.",
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              introEncouragement: {
                type: import_genai.Type.STRING,
                description: "\xC7ocu\u011Fu motive eden k\u0131sa sevimli bir giri\u015F c\xFCmlesi."
              },
              steps: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    stepNumber: { type: import_genai.Type.INTEGER },
                    title: { type: import_genai.Type.STRING },
                    type: { type: import_genai.Type.STRING, description: "focus | rule | elimination" },
                    content: { type: import_genai.Type.STRING, description: "\u0130pucu a\xE7\u0131klamas\u0131" },
                    keyObservation: { type: import_genai.Type.STRING, description: "Dikkat edilmesi gereken k\u0131sa p\xFCf nokta" },
                    suggestedAction: { type: import_genai.Type.STRING, description: "\xC7ocu\u011Fun \u015Fimdi yapmas\u0131n\u0131 \xF6nerdi\u011Fin eylem" }
                  },
                  required: ["stepNumber", "title", "type", "content"]
                }
              }
            },
            required: ["introEncouragement", "steps"]
          }
        }
      });
      const rawJson = response.text?.trim();
      if (!rawJson) {
        return res.status(200).json({ fallback: true });
      }
      const parsed = JSON.parse(rawJson);
      return res.json({
        success: true,
        fallback: false,
        questionId,
        category,
        questionType,
        difficulty,
        totalSteps: 3,
        unlockedSteps: Math.min(3, Math.max(1, stepRequested)),
        introEncouragement: parsed.introEncouragement,
        steps: parsed.steps,
        isAiGenerated: true,
        modelUsed: "gemini-2.5-flash"
      });
    } catch (err) {
      console.log("AI fallback triggered: AI hint unavailable");
      return res.status(200).json({
        fallback: true,
        error: err?.message || "AI service error"
      });
    }
  });
  app.post("/api/ai-explain-mistake", async (req, res) => {
    try {
      const {
        questionId,
        questionType,
        category,
        difficulty,
        prompt,
        secondaryPrompt,
        explanation,
        options,
        selectedOptionId,
        correctOptionId
      } = req.body;
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(200).json({
          fallback: true,
          message: "Gemini API key is not configured; using procedural mistake analyzer."
        });
      }
      const promptContext = `
Sen B\u0130LSEM (Bilim ve Sanat Merkezleri) ve bili\u015Fsel yetenek s\u0131navlar\u0131na haz\u0131rlanan ilkokul \xF6\u011Frencileri (7-11 ya\u015F) i\xE7in uzman, \u015Fefkatli bir "\xC7ocuk Bili\u015Fsel Pedagoji Uzman\u0131"s\u0131n.

Bir \xF6\u011Frenci bir soru \xFCzerinde d\xFC\u015F\xFCn\xFCrken yanl\u0131\u015F bir se\xE7enek i\u015Faretledi.
Amac\u0131n: \xC7ocu\u011Fu ASLA yarg\u0131lamadan, su\xE7lamadan, \u015Fefkatle ve yap\u0131c\u0131 bir dille:
1. \xD6\u011Frencinin se\xE7ti\u011Fi yanl\u0131\u015F se\xE7ene\u011Fin mant\u0131\u011F\u0131n\u0131 anlamak (neden bu se\xE7ene\u011Fe y\xF6nelmi\u015F olabilir, g\xF6rsel/mant\u0131ksal tuzak neydi?).
2. \xC7ocu\u011Fun se\xE7ti\u011Fi se\xE7enek ile DO\u011ERU se\xE7enek aras\u0131ndaki kritik fark\u0131 net ve somut bir dille a\xE7\u0131klamak.
3. \xC7ocu\u011Fun bir sonraki soruda hatay\u0131 tekrarlamamas\u0131 i\xE7in ak\u0131lda kal\u0131c\u0131 bir "Alt\u0131n Kural / Bili\u015Fsel Taktik" kazand\u0131rmak.

Soru Bilgileri:
- Kategori: ${category}
- Soru Tipi: ${questionType}
- Zorluk Seviyesi: ${difficulty} / 6
- Soru Metni: "${prompt}" ${secondaryPrompt ? `(${secondaryPrompt})` : ""}
- Sorunun Mant\u0131k \xD6zeti ve \xC7\xF6z\xFCm Ad\u0131mlar\u0131: "${explanation?.summary || ""}" - "${explanation?.steps?.join(" | ") || ""}"
- Se\xE7enekler: ${JSON.stringify(options || [])}
- \xD6\u011Frencinin \u0130\u015Faretledi\u011Fi Yanl\u0131\u015F Se\xE7enek: ${selectedOptionId}
- Do\u011Fru Se\xE7enek: ${correctOptionId}

\xDCslup Kurallar\u0131:
- Dil: \xC7ok samimi, sevecen, cesaret verici, T\xFCrk\xE7e ("\xC7ok g\xFCzel bir denemeydi!", "Hadi zihnimizin nerede \u015Fa\u015F\u0131rd\u0131\u011F\u0131n\u0131 birlikte g\xF6relim!").
- Ya\u015F Grubu: 7-11 ya\u015F ilkokul \xE7ocuklar\u0131. C\xFCmleler ak\u0131c\u0131, a\xE7\u0131k ve pozitif olmal\u0131.
`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptContext,
        config: {
          systemInstruction: "Sen \xE7ocuklar i\xE7in bili\u015Fsel zeka sorular\u0131nda hatan\u0131n nedenini \u015Fefkatle, pedagojik ve Sokratik olarak a\xE7\u0131klayan bir uzmans\u0131n. \xC7ocu\u011Fu y\xFCreklendir.",
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              empatheticIntro: {
                type: import_genai.Type.STRING,
                description: "\xC7ocu\u011Fun bu se\xE7ene\u011Fi se\xE7mesini anlay\u0131\u015Fla kar\u015F\u0131layan, \u015Fefkatli giri\u015F c\xFCmlesi."
              },
              misconceptionTrap: {
                type: import_genai.Type.STRING,
                description: "Sorudaki g\xF6rsel yan\u0131lsama, \xE7eldirici veya g\xF6zden ka\xE7an kural\u0131n analizi."
              },
              differenceAnalysis: {
                type: import_genai.Type.STRING,
                description: "\u0130\u015Faretlenen se\xE7enek ile do\u011Fru se\xE7enek aras\u0131ndaki somut fark\u0131n a\xE7\u0131klamas\u0131."
              },
              goldenRuleTip: {
                type: import_genai.Type.STRING,
                description: "Bir sonraki benzer soruda \xE7ocu\u011Fa rehberlik edecek ak\u0131lda kal\u0131c\u0131 alt\u0131n kural."
              },
              bilsemSuperPower: {
                type: import_genai.Type.STRING,
                description: "Bu hatadan kazan\u0131lan bili\u015Fsel s\xFCper g\xFC\xE7 unvan\u0131 (\xF6rn: Par\xE7a-B\xFCt\xFCn Dedektifi)."
              }
            },
            required: [
              "empatheticIntro",
              "misconceptionTrap",
              "differenceAnalysis",
              "goldenRuleTip",
              "bilsemSuperPower"
            ]
          }
        }
      });
      const rawJson = response.text?.trim();
      if (!rawJson) {
        return res.status(200).json({ fallback: true });
      }
      const parsed = JSON.parse(rawJson);
      return res.json({
        success: true,
        fallback: false,
        questionId,
        selectedOptionId,
        correctOptionId,
        category,
        questionType,
        difficulty,
        empatheticIntro: parsed.empatheticIntro,
        misconceptionTrap: parsed.misconceptionTrap,
        differenceAnalysis: parsed.differenceAnalysis,
        goldenRuleTip: parsed.goldenRuleTip,
        bilsemSuperPower: parsed.bilsemSuperPower,
        isAiGenerated: true,
        modelUsed: "gemini-2.5-flash"
      });
    } catch (err) {
      console.log("AI fallback triggered: AI mistake explanation unavailable");
      return res.status(200).json({
        fallback: true,
        error: err?.message || "AI service error"
      });
    }
  });
  app.post("/api/ai-step-explanation", async (req, res) => {
    try {
      const {
        questionId,
        questionType,
        category,
        difficulty,
        prompt,
        secondaryPrompt,
        explanation,
        options,
        selectedOptionId,
        correctOptionId,
        isCorrect
      } = req.body;
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(200).json({
          fallback: true,
          message: "Gemini API key is not configured; using procedural step engine."
        });
      }
      const promptContext = `
Sen B\u0130LSEM (Bilim ve Sanat Merkezleri) ve \xFCst\xFCn bili\u015Fsel yetenek s\u0131navlar\u0131na haz\u0131rlanan ilkokul \xF6\u011Frencileri (7-11 ya\u015F) i\xE7in \xF6zel tasarlanm\u0131\u015F uzman, \u015Fefkatli bir "Bili\u015Fsel Zeka ve Pedagojik \xC7\xF6z\xFCm Rehberisin".

\xD6\u011Frenci soruyu \xE7\xF6zd\xFC ve cevab\u0131n\u0131 g\xF6nderdi.
- \xD6\u011Frencinin Cevab\u0131: ${selectedOptionId}
- Do\u011Fru Cevap: ${correctOptionId}
- Sonu\xE7: ${isCorrect ? "DO\u011ERU! Tebrik et ve mant\u0131\u011F\u0131 peki\u015Ftir." : "YANLI\u015E. Neden yan\u0131ld\u0131\u011F\u0131n\u0131 ve do\u011Fru yolu \u015Fefkatle a\xE7\u0131kla."}

Soru Bilgileri:
- Kategori: ${category}
- Soru Tipi: ${questionType}
- Zorluk Seviyesi: ${difficulty} / 6
- Soru Metni: "${prompt}" ${secondaryPrompt ? `(${secondaryPrompt})` : ""}
- Sorunun Mant\u0131k \xD6zeti ve \xC7\xF6z\xFCm Ad\u0131mlar\u0131: "${explanation?.summary || ""}" - "${explanation?.steps?.join(" | ") || ""}"
- Kural Ba\u015Fl\u0131\u011F\u0131: "${explanation?.ruleTitle || ""}"
- Se\xE7enekler: ${JSON.stringify(options || [])}

G\xD6REV\u0130N: \xC7ocu\u011Fun zihninde soru \xE7\xF6z\xFCm\xFCn\xFC netle\u015Ftirecek 4 KADEMEL\u0130 ADIM ADIM (Step-by-Step) Pedagojik Akordiyon A\xE7\u0131klamas\u0131 olu\u015Fturmakt\u0131r:
1. "focus" (G\xF6rsel Odak & \u0130lk Bak\u0131\u015F): \xC7ocu\u011Fun g\xF6z\xFCn\xFC nereye dikmesi gerekti\u011Fini ve sorunun kalbini g\xF6ster. (Rozet: "1. Odaklanma")
2. "rule" (Gizli Kural & \xD6r\xFCnt\xFC): \u015Eekillerin veya say\u0131lar\u0131n arkas\u0131ndaki de\u011Fi\u015Fim kural\u0131n\u0131 (d\xF6nme, par\xE7a art\u0131\u015F\u0131, simetri, analoji vb.) a\xE7\u0131kla. (Rozet: "2. Kural Ke\u015Ffi")
3. "elimination" (\xC7eldiricileri Eleme & Do\u011Frulama): Yan\u0131lt\u0131c\u0131 se\xE7eneklerin neden yanl\u0131\u015F oldu\u011Funu ve do\u011Fru se\xE7ene\u011Fin neden tam oturdu\u011Funu netle\u015Ftir. (Rozet: "3. Eleme & Sonu\xE7")
4. "tactic" (Bili\u015Fsel Alt\u0131n Taktik & B\u0130LSEM P\xFCf Noktas\u0131): Gelecek sorularda i\u015Fine yarayacak ak\u0131lda kal\u0131c\u0131 pratik bir zeka takti\u011Fi ver. (Rozet: "4. Alt\u0131n Taktik")

\xDCslup:
- \xC7ok sevimli, cesaret verici, samimi, T\xFCrk\xE7e ve 7-11 ya\u015F \xE7ocuk seviyesine uygun.
- Her ad\u0131m\u0131n a\xE7\u0131klamas\u0131 2-3 c\xFCmle, net ve merak uyand\u0131r\u0131c\u0131 olmal\u0131.
`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptContext,
        config: {
          systemInstruction: "Sen \xE7ocuklar i\xE7in bili\u015Fsel zeka sorular\u0131nda akordiyon yap\u0131s\u0131yla ad\u0131m ad\u0131m \xE7\xF6z\xFCm sunan pedagojik bir AI e\u011Fitmenisin.",
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              headlineTitle: {
                type: import_genai.Type.STRING,
                description: "\xC7\xF6z\xFCm i\xE7in ilgi \xE7ekici k\u0131sa ba\u015Fl\u0131k (\xF6rn: Matris \xC7\xF6z\xFCm Dedektifi)"
              },
              pedagogicalSummary: {
                type: import_genai.Type.STRING,
                description: "\xC7\xF6z\xFCm\xFCn ana fikrini \xF6zetleyen tek c\xFCmlelik dostane a\xE7\u0131klama"
              },
              steps: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    stepNumber: { type: import_genai.Type.INTEGER },
                    title: { type: import_genai.Type.STRING },
                    badge: { type: import_genai.Type.STRING },
                    type: {
                      type: import_genai.Type.STRING,
                      description: "focus | rule | elimination | tactic"
                    },
                    explanation: { type: import_genai.Type.STRING },
                    keyObservation: { type: import_genai.Type.STRING },
                    visualAnchor: { type: import_genai.Type.STRING }
                  },
                  required: ["stepNumber", "title", "badge", "type", "explanation"]
                }
              }
            },
            required: ["headlineTitle", "pedagogicalSummary", "steps"]
          }
        }
      });
      const rawJson = response.text?.trim();
      if (!rawJson) {
        return res.status(200).json({ fallback: true });
      }
      const parsed = JSON.parse(rawJson);
      return res.json({
        success: true,
        fallback: false,
        questionId,
        selectedOptionId,
        correctOptionId,
        isCorrect: Boolean(isCorrect),
        category,
        questionType,
        difficulty,
        headlineTitle: parsed.headlineTitle,
        pedagogicalSummary: parsed.pedagogicalSummary,
        steps: parsed.steps,
        isAiGenerated: true,
        modelUsed: "gemini-2.5-flash"
      });
    } catch (err) {
      console.log("AI fallback triggered: AI step explanation unavailable");
      return res.status(200).json({
        fallback: true,
        error: err?.message || "AI service error"
      });
    }
  });
  app.post("/api/ai-daily-plan", async (req, res) => {
    try {
      const {
        studentName = "\xD6\u011Frenci",
        grade = 3,
        level = 4,
        streak = 5,
        dailyGoalQuestions = 10,
        dailyGoalMinutes = 15,
        todayQuestionsSolved = 0,
        unresolvedMistakes = [],
        masteries = []
      } = req.body;
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(200).json({
          fallback: true,
          message: "Gemini API key is not configured; using procedural pedagogical plan generator."
        });
      }
      const promptContext = `
Sen B\u0130LSEM (Bilim ve Sanat Merkezleri) ve \xFCst\xFCn yetenekli ilkokul \xF6\u011Frencileri (7-11 ya\u015F) i\xE7in \xE7al\u0131\u015Fan uzman bir "Yapay Zeka Bili\u015Fsel Ko\xE7 ve E\u011Fitim Tasar\u0131mc\u0131s\u0131s\u0131n".

\xD6\u011Frenci Bilgileri:
- \u0130sim: ${studentName}
- S\u0131n\u0131f: ${grade}. S\u0131n\u0131f
- Seviye: Seviye ${level}
- G\xFCnl\xFCk Seri: ${streak} G\xFCn
- G\xFCnl\xFCk Hedef: ${dailyGoalQuestions} Soru, ${dailyGoalMinutes} Dakika
- Bug\xFCn \u015Eu Ana Kadar \xC7\xF6z\xFClen Soru Say\u0131s\u0131: ${todayQuestionsSolved}

\xD6\u011Frencinin Bili\u015Fsel Beceri Ba\u015Far\u0131 Durumu (Mastery):
${JSON.stringify(
        masteries.map((m) => ({
          kategori: m.category,
          ad: m.categoryName,
          ustalikYuzdesi: m.mastery,
          dogrulukOrani: m.accuracy,
          trend: m.recentTrend
        })),
        null,
        2
      )}

Hata Defterinde \xC7\xF6z\xFCm Bekleyen Sorular (${unresolvedMistakes.length} adet):
${JSON.stringify(
        unresolvedMistakes.slice(0, 5).map((m) => ({
          kategori: m.category,
          tip: m.questionType,
          zorluk: m.difficulty,
          metin: m.prompt
        })),
        null,
        2
      )}

G\xD6REV\u0130N:
Her sabah g\xFCncellenen, bu \xF6\u011Frencinin GER\xC7EK EKS\u0130K OLDU\u011EU (en d\xFC\u015F\xFCk ba\u015Far\u0131 y\xFCzdesine sahip veya hata defterinde bekleyen sorular\u0131 bulunan) konular\u0131 hedef alan K\u0130\u015E\u0130SELLE\u015ET\u0130R\u0130LM\u0130\u015E B\u0130R "BUG\xDCN\xDCN \xC7ALI\u015EMA PLANI" \xFCretmektir.

Plan \u015Eunlar\u0131 \u0130\xE7ermelidir:
1. "greetingTitle": Sabah enerjisi veren, ne\u015Feli, ki\u015Fiselle\u015Ftirilmi\u015F ba\u015Fl\u0131k (\xF6rn: "G\xFCnayd\u0131n Deniz! Bug\xFCn Zihnini Parlatma Vakti \u{1F680}")
2. "morningCoachMessage": \xC7ocu\u011Fun d\xFCnk\xFC serisini \xF6ven, bug\xFCn hangi 2 zay\u0131f alan\u0131n\u0131 (\xF6rn. Matris & \xD6r\xFCnt\xFC) g\xFC\xE7lendirece\u011Fini anlatan samimi 2-3 c\xFCmlelik ko\xE7luk notu.
3. "motivationalQuote": G\xFCne ba\u015Flarken ilham verecek k\u0131sa bir zeka/\xF6zg\xFCven s\xF6z\xFC.
4. "focusWeaknesses": \xD6\u011Frencinin en zay\u0131f oldu\u011Fu 2 veya 3 kategori i\xE7in te\u015Fhis ve neden bug\xFCn \xFCzerinde durulmas\u0131 gerekti\u011Finin \xE7ocuk diliyle pedagojik a\xE7\u0131klamas\u0131.
5. "tasks": Tam olarak 3 adet g\xFCnl\xFCk hedef g\xF6revi:
   - G\xF6rev 1: En zay\u0131f kategoride pratik (\xF6rn. "Zay\u0131f Alan G\xFC\xE7lendirme: 4 Soru Matris Prati\u011Fi", actionType: "practice_category", category: en zay\u0131f kategori, targetCount: 4)
   - G\xF6rev 2: Varsa Hata Defteri tekrar\u0131 veya 2. zay\u0131f konu (\xF6rn. "Hata Av\u0131: Bekleyen Sorular\u0131 Fetheyle", actionType: "review_mistakes" veya "practice_category")
   - G\xF6rev 3: Destekleyici pratik veya adaptif antrenman (actionType: "adaptive_session" veya "practice_category")
6. "dailySuperpowerTarget": Bug\xFCn kazan\u0131lacak bili\u015Fsel s\xFCper g\xFC\xE7 unvan\u0131 (\xF6rn: "Matris Sihirbaz\u0131 & 3D Pusula")
7. "totalTargetQuestions": ${dailyGoalQuestions || 10}
8. "estimatedMinutes": ${dailyGoalMinutes || 15}

\xDCslup:
- \xC7ok s\u0131cak, cesaretlendirici, motive edici, T\xFCrk\xE7e ve \xE7ocuk dostu olmal\u0131d\u0131r.
`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptContext,
        config: {
          systemInstruction: "Sen B\u0130LSEM \xF6\u011Frencileri i\xE7in her sabah ki\u015Fiselle\u015Ftirilmi\u015F zeka antrenman program\u0131 haz\u0131rlayan pedagojik bir AI e\u011Fitim ko\xE7usun. Eksik konular\u0131 hedefler ve \xE7ocu\u011Fu y\xFCreklendirirsin.",
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              greetingTitle: {
                type: import_genai.Type.STRING,
                description: "Sabah kar\u015F\u0131lama ba\u015Fl\u0131\u011F\u0131"
              },
              morningCoachMessage: {
                type: import_genai.Type.STRING,
                description: "Sabah motivasyon ve rehberlik ko\xE7luk mesaj\u0131 (2-3 c\xFCmle)"
              },
              motivationalQuote: {
                type: import_genai.Type.STRING,
                description: "G\xFCn\xFCn ilham veren zeka s\xF6z\xFC"
              },
              focusWeaknesses: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    category: { type: import_genai.Type.STRING },
                    categoryName: { type: import_genai.Type.STRING },
                    reason: { type: import_genai.Type.STRING },
                    currentMastery: { type: import_genai.Type.NUMBER }
                  },
                  required: ["category", "categoryName", "reason", "currentMastery"]
                }
              },
              tasks: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    id: { type: import_genai.Type.STRING },
                    title: { type: import_genai.Type.STRING },
                    description: { type: import_genai.Type.STRING },
                    category: { type: import_genai.Type.STRING },
                    targetCount: { type: import_genai.Type.NUMBER },
                    completedCount: { type: import_genai.Type.NUMBER },
                    rewardXP: { type: import_genai.Type.NUMBER },
                    isCompleted: { type: import_genai.Type.BOOLEAN },
                    priority: { type: import_genai.Type.STRING },
                    actionType: { type: import_genai.Type.STRING }
                  },
                  required: [
                    "id",
                    "title",
                    "description",
                    "category",
                    "targetCount",
                    "completedCount",
                    "rewardXP",
                    "isCompleted",
                    "priority",
                    "actionType"
                  ]
                }
              },
              dailySuperpowerTarget: {
                type: import_genai.Type.STRING,
                description: "Bug\xFCn hedeflenen bili\u015Fsel s\xFCper g\xFC\xE7 rozeti unvan\u0131"
              },
              totalTargetQuestions: {
                type: import_genai.Type.NUMBER,
                description: "Toplam soru adedi hedefi"
              },
              estimatedMinutes: {
                type: import_genai.Type.NUMBER,
                description: "Tahmini tamamlanma s\xFCresi (dakika)"
              }
            },
            required: [
              "greetingTitle",
              "morningCoachMessage",
              "motivationalQuote",
              "focusWeaknesses",
              "tasks",
              "dailySuperpowerTarget",
              "totalTargetQuestions",
              "estimatedMinutes"
            ]
          }
        }
      });
      const rawJson = response.text?.trim();
      if (!rawJson) {
        return res.status(200).json({ fallback: true });
      }
      const parsed = JSON.parse(rawJson);
      return res.json({
        success: true,
        fallback: false,
        greetingTitle: parsed.greetingTitle,
        morningCoachMessage: parsed.morningCoachMessage,
        motivationalQuote: parsed.motivationalQuote,
        focusWeaknesses: parsed.focusWeaknesses,
        tasks: parsed.tasks,
        dailySuperpowerTarget: parsed.dailySuperpowerTarget,
        totalTargetQuestions: parsed.totalTargetQuestions || dailyGoalQuestions,
        estimatedMinutes: parsed.estimatedMinutes || dailyGoalMinutes,
        isAiGenerated: true,
        modelUsed: "gemini-2.5-flash"
      });
    } catch (err) {
      console.log("AI fallback triggered: AI daily plan unavailable");
      return res.status(200).json({
        fallback: true,
        error: err?.message || "AI plan service error"
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
