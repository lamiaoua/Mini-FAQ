// pages/api/ask.js
import fs from 'fs';
import path from 'path';

// ==================== FONCTION DE SAUVEGARDE DES LOGS (SERVEUR) ====================
function saveToLogs(question, answer, model) {
  try {
    const now = new Date();
    const timestamp = now.toISOString();
    
    const logEntry = {
      timestamp: timestamp,
      date: now.toLocaleDateString('fr-FR'),
      time: now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3
      }),
      question: question,
      answer: answer,
      model: model
    };

    const logsDir = path.join(process.cwd(), 'logs');
    const logsFile = path.join(logsDir, 'conversations.json');

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    let logs = [];
    if (fs.existsSync(logsFile)) {
      const fileContent = fs.readFileSync(logsFile, 'utf8');
      logs = JSON.parse(fileContent);
    }

    logs.push(logEntry);
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2), 'utf8');

    console.log("💾 Log serveur sauvegardé:", logsFile);

  } catch (error) {
    console.error("❌ Erreur sauvegarde logs serveur:", error.message);
  }
}

// ==================== FONCTION FALLBACK MOTS-CLÉS ====================
function getFallbackAnswer(question) {
  const lower = question.toLowerCase();
  
  // Mots-clés salutations
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("bonjour") || lower.includes("salut")) {
    return "Bonjour ! Je suis votre assistant FAQ. Posez-moi une question sur nos prix, services, horaires ou contactez-nous.";
  }
  
  if (lower.includes("prix") || lower.includes("coût") || lower.includes("tarif") || lower.includes("price")) {
    return "Nos tarifs démarrent à partir de 9,99€ par mois. Contactez-nous pour plus d'informations.";
  }
  
  if (lower.includes("projet") || lower.includes("project") || lower.includes("travaux")) {
    return "Nous avons actuellement plusieurs projets IA en cours de développement. Visitez notre site pour plus de détails.";
  }
  
  if (lower.includes("contact") || lower.includes("email") || lower.includes("téléphone") || lower.includes("joindre")) {
    return "Vous pouvez nous contacter à contact@company.com ou via notre formulaire sur le site web.";
  }
  
  if (lower.includes("horaire") || lower.includes("ouvert") || lower.includes("disponible") || lower.includes("heure")) {
    return "Nous sommes disponibles du lundi au vendredi de 9h à 18h. Pour toute urgence, utilisez notre formulaire de contact.";
  }
  
  if (lower.includes("service") || lower.includes("offre") || lower.includes("produit")) {
    return "Nous proposons des solutions IA personnalisées, du développement web et du consulting. Contactez-nous pour en savoir plus.";
  }
  
  if (lower.includes("aide") || lower.includes("help") || lower.includes("support") || lower.includes("problème")) {
    return "Notre équipe support est là pour vous aider. Envoyez-nous un email à support@company.com avec votre question détaillée.";
  }
  
  return "Désolé, je n'ai pas de réponse précise à cette question. Veuillez contacter notre équipe à contact@company.com pour plus d'informations.";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body;

  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "No question provided" });
  }

  try {
    console.log("🔑 Clé API présente:", !!process.env.HF_API_KEY);
    console.log("❓ Question:", question);
    console.log("🤖 Modèle: MiniMaxAI/MiniMax-M2");

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "MiniMaxAI/MiniMax-M2",
          messages: [
            {
              role: "system",
              content: "Tu es un assistant FAQ qui répond UNIQUEMENT en français. Tu réponds de manière courte et directe aux questions. Ne te présente JAMAIS. Réponds directement à la question posée."
            },
            {
              role: "user",
              content: question
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          stream: false
        }),
      }
    );

    console.log("📡 Status HTTP:", response.status);

    const data = await response.json();
    console.log("📦 Réponse complète:", JSON.stringify(data, null, 2));

    if (!response.ok || data.error) {
      console.error("❌ Erreur API:", data.error || response.statusText);
      
      console.log("⚠️ MiniMax-M2 non disponible, activation du fallback mots-clés...");
      const fallbackAnswer = getFallbackAnswer(question);
      
      saveToLogs(question, fallbackAnswer, "Fallback (mots-clés)");
      
      return res.status(200).json({ 
        answer: fallbackAnswer,
        model: "Fallback (mots-clés)",
        note: "Le modèle IA n'était pas disponible, une réponse pré-enregistrée a été fournie.",
        saveToClient: true
      });
    }

    const answer = data.choices?.[0]?.message?.content;

    if (!answer || answer.trim() === "") {
      console.warn("⚠️ Aucune réponse générée, utilisation du fallback");
      const fallbackAnswer = getFallbackAnswer(question);
      saveToLogs(question, fallbackAnswer, "Fallback (mots-clés)");
      
      return res.status(200).json({ 
        answer: fallbackAnswer,
        model: "Fallback (mots-clés)",
        saveToClient: true
      });
    }

    console.log("✅ Réponse brute:", answer);

    let cleanAnswer = answer.trim();
    cleanAnswer = cleanAnswer.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    cleanAnswer = cleanAnswer.replace(/<[^>]+>/g, '').trim();

    console.log("✅ Réponse nettoyée:", cleanAnswer);

    saveToLogs(question, cleanAnswer, "MiniMaxAI/MiniMax-M2");

    return res.status(200).json({ 
      answer: cleanAnswer,
      model: "MiniMaxAI/MiniMax-M2",
      saveToClient: true
    });

  } catch (error) {
    console.error("💥 Erreur:", error.message);

    const fallbackAnswer = getFallbackAnswer(question);
    saveToLogs(question, fallbackAnswer, "Fallback (erreur critique)");

    return res.status(200).json({ 
      answer: fallbackAnswer,
      model: "Fallback (erreur critique)",
      note: `Une erreur est survenue: ${error.message}`,
      saveToClient: true
    });
  }
}