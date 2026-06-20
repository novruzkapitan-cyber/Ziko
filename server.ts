import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parser for body payloads
app.use(express.json());

// Initialize Gemini Client safely with telemetry user-agent
const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("XƏBƏRDARLIQ: GEMINI_API_KEY mühit dəyişəni təyin edilməyib! API zəngləri uğursuz olacaq.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

const ai = getGeminiClient();

// API ROUTES FIRST

// Endpoint 1: Ask AI to explain a specific question step-by-step for a 6th grader
app.post("/api/explain", async (req, res) => {
  const { question, options, correctIndex, chosenIndex, subject, topic } = req.body;

  if (!question || !options || correctIndex === undefined) {
    return res.status(400).json({ error: "Bütün lazımi məlumatlar (sual, seçimlər və düzgün cavab) təqdim edilməlidir." });
  }

  const isCorrect = chosenIndex !== undefined && chosenIndex === correctIndex;
  const chosenText = chosenIndex !== undefined ? options[chosenIndex] : "Cavab verilməyib";
  const correctText = options[correctIndex];

  const systemPrompt = `Sən Azərbaycan məktəblərində çalışan mehriban, həvəsləndirici və peşəkar 11-12 yaşlı uşaqlar üçün 6-cı sinif müəllimisən.
Məqsədin şagirdə başa düşmədiyi sualı çox sadə, addım-addım, cana-yaxın və ruhlandırıcı tərzdə Azərbaycan dilində izah etməkdir.
Zərurət yarandıqda uşaqların vizuallaşdıra biləcəyi nümunələr və sadə şərhlər (mətn əsaslı vizual təsvirlər) istifadə et.
Uşağı tənqid etmə, səhv edibsə belə "Eybi yoxdur, səhvlər bizim öyrənmə yolumuzdur!" tipli pozitiv sözlərlə dəstəklə.
Düzgün tapıbsa, onu səmimi təriflə!`;

  const userPrompt = `Fənn: ${subject || "Riyaziyyat"}
Mövzu: ${topic || "Ümumi"}
Sual: ${question}
Seçimlər:
${options.map((opt: string, idx: number) => `${idx + 1}) ${opt}`).join("\n")}

Düzgün Cavab: ${correctText}
Şagirdin Cavabı: ${chosenText} (Düzgündürmü: ${isCorrect ? "Bəli" : "Xeyr"})

Zəhmət olmasa bu sualı 6-cı sinif şagirdi üçün mükəmməl şəkildə izah et. İzah çox uzun və sıxıcı olmasın, amma tam anlaşılan olsun. İzahda bu bəndləri saxla:
1. Mehriban salamlama və stimulverici giriş.
2. Sualın mahiyyəti nədir (nəyi tapmalıyıq)?
3. Addım-addım asan həlli.
4. Niyə digər bəndlər deyil (qısaca)?
5. Sonda uşağa gələcək suallar üçün ürəkləndirici qapanış cümləsi.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ explanation: response.text || "İzah yaradıla bilmədi. Zəhmət olmasa bir daha yoxlayın." });
  } catch (error: any) {
    console.error("Explain API xətası:", error);
    res.status(500).json({ error: "Süni İntellekt izahı yaradarkən xəta baş verdi: " + (error.message || error) });
  }
});

// Endpoint 2: Generate dynamic curriculum aligned multiple-choice questions
app.post("/api/generate-questions", async (req, res) => {
  const { subjectId, topic, count = 3 } = req.body;

  const subjectNames: { [key: string]: string } = {
    math: "Riyaziyyat (6-cı sinif dərsliklərinə tam uyğun: ƏBOB, EKOB, Adi kəsrlərin vurulması/bölünməsi, mütənasiblik, faiz, mənfi və müsbət ədədlər, tənliklər, dairə, koordinat sistemi və s.)",
    lang: "Azərbaycan Dili (6-cı sinif kurikulumu: leksika, omonimlər, sinonimlər, ismin quruluşca növləri, sifət dərəcələri, əvəzliklər)",
    science: "Həyat Bilgisi (6-cı sinif: hüceyrə, maddələrin quruluşu, ekologiya, ilk tibbi yardım)",
    history: "Azərbaycan Tarixi (6-cı sinif: qədim insan məskənləri, Atropatena, Albaniya, qədim tayfalar)"
  };

  const selectedSubject = subjectNames[subjectId] || "6-cı sinif kurikulumu";

  const systemInstruction = `Sən Azərbaycanın 6-cı sinif kurikulumu üzrə professional dərslik və test hazırlayan mütəxəssissən.
Sənə verilən fənn və mövzu üzrə 6-cı sinif şagirdinin asanlıqla anlaya biləcəyi, dərsliklərə (xüsusən Riyaziyyat üçün 1-ci və 2-ci hissələrə) tam uyğun gələn ${count} ədəd maraqlı və fərqli test sualı hazırlamalısan.
Hər bir sualın 4 seçimi (A, B, C, D) olmalı, yalnız biri tam düzgün olmalıdır. 
Düzgün cavabın indeksi 0-dan 3-ə qədər bir tam ədəd olmalıdır (0=A, 1=B, 2=C, 3=D).
Həmçinin sualın uşaq üçün qısa və aydın izahını da təmin et.
Həmişə yalnız təmiz JSON massivi qaytar.`;

  const userPrompt = `Fənn: ${selectedSubject}
Mövzu (bölmə): ${topic || "Ümumi"}
Sayı: ${count} dənə test sualı hazırlasın.
Bütün suallar sırf 6-cı sinif səviyyəsində, real həyat ssenariləri və dərslik suallarına bənzər maraqlı formalarda olsun. Suallar yalnız Azərbaycan dilində olmalıdır.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of generated multi-choice questions",
          items: {
            type: Type.OBJECT,
            required: ["question", "options", "correctIndex", "explanation"],
            properties: {
              question: {
                type: Type.STRING,
                description: "The complete question text in Azerbaijani."
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of exactly 4 multiple choice options."
              },
              correctIndex: {
                type: Type.INTEGER,
                description: "The 0-based index of the correct option (0 to 3)."
              },
              explanation: {
                type: Type.STRING,
                description: "A short, simple pedagogical explanation for why this is correct."
              }
            }
          }
        },
        temperature: 0.8,
      }
    });

    const questionsText = response.text || "[]";
    const questions = JSON.parse(questionsText.trim());

    // Map to include ID & metadata tags
    const processedQuestions = questions.map((q: any, idx: number) => ({
      id: `generated_${subjectId}_${Date.now()}_${idx}`,
      subject: subjectId,
      topic: topic || "Süni İntellekt",
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      isAiGenerated: true
    }));

    res.json({ questions: processedQuestions });
  } catch (error: any) {
    console.error("Generate Questions API xətası:", error);
    res.status(500).json({ error: "Süni İntellekt sualları hazırlayarkən xəta baş verdi: " + (error.message || error) });
  }
});

// Endpoint 3: AI Tutor assistant for custom inquiries
app.post("/api/ask-tutor", async (req, res) => {
  const { messages, context } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Söhbət tarixçəsi (messages) massivi göndərilməlidir." });
  }

  // Format messages into Content format
  const formattedContents = messages.map((msg: any) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const systemInstruction = `Sən 6-cı sinif şagirdləri üçün səmimi, pozitiv və çox savadlı bir Azərbaycan fənn müəllimisən (xüsusən Riyaziyyat, Azərbaycan dili, Həyat bilgisi və Tarix üzrə).
Şagirdlərin suallarına cana-yaxın, qısa və aydın şəkildə izah ver. Onların motivasiyasını qaldır, "Halaldır sənə!", "Çox gözəl sualdır!", "Gəl birlikdə araşdıraq!" kimi cümlələrlə danışığa başla.
Riyazi suallarda ədədləri, düsturları çox xırda uşaq dili ilə və aydın izah et. Məsələn, mənfi ədədləri toplamağı "borc" nümunəsi ilə izah et.
Şagird başa düşmədiyini deyirsə, başqa bir sadə misalla yenidən izah et. Cavan, pozitiv, gülərüz bir müəllim rolundasan.`;

  if (context) {
    formattedContents.unshift({
      role: 'user',
      parts: [{ text: `Kontekst məlumatı: Şagird hazırda bu sual üzərində işləyir və ya kömək istəyir. Sual: "${context.questionText}". Düzgün cavab: "${context.correctAnswer}". Şagirdin verdiyi cavab: "${context.submittedAnswer || "hələ cavab verməyib"}".` }]
    });
    formattedContents.unshift({
      role: 'model',
      parts: [{ text: "Bəli, bu konteksti nəzərə alaraq şagirdə ən yaxşı köməkliyi göstərəcəm." }]
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text || "Üzr istəyirəm, cavab tapa bilmədim. Bir daha sual verə bilərsən?" });
  } catch (error: any) {
    console.error("Ask Tutor API xətası:", error);
    res.status(500).json({ error: "AI Köməkçi cavab verərkən xəta baş verdi: " + (error.message || error) });
  }
});


// MIDDLEWARE SETUP FOR DEV/PROD
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for fast development feedback loop
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the compiled static output in the dist directory
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
