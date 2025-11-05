// components/ChatComponent.js
import { useState, useEffect } from 'react';

export default function ChatComponent() {
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // ==================== CHARGER L'HISTORIQUE AU DÉMARRAGE ====================
  useEffect(() => {
    loadHistoryFromLocalStorage();
  }, []);

  // ==================== CHARGER DEPUIS LOCALSTORAGE ====================
  const loadHistoryFromLocalStorage = () => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
        console.log('📖 Historique chargé:', parsed.length, 'conversations');
      }
    } catch (error) {
      console.error('❌ Erreur chargement historique:', error);
    }
  };

  // ==================== SAUVEGARDER DANS LOCALSTORAGE ====================
  const saveToLocalStorage = (newQuestion, newAnswer, model) => {
    try {
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('fr-FR'),
        time: new Date().toLocaleTimeString('fr-FR'),
        question: newQuestion,
        answer: newAnswer,
        model: model
      };

      // Ajouter à l'historique existant
      const updatedHistory = [...history, newEntry];
      setHistory(updatedHistory);

      // Sauvegarder dans localStorage
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
      
      console.log('💾 Sauvegardé dans localStorage:', newEntry);
    } catch (error) {
      console.error('❌ Erreur sauvegarde localStorage:', error);
    }
  };

  // ==================== ENVOYER LA QUESTION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;

    setLoading(true);
    setCurrentAnswer('');

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      const data = await response.json();

      if (data.answer) {
        setCurrentAnswer(data.answer);
        
        // ✅ SAUVEGARDER DANS LOCALSTORAGE
        if (data.saveToClient) {
          saveToLocalStorage(question, data.answer, data.model);
        }
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      setCurrentAnswer('⚠️ Erreur de connexion');
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  // ==================== EFFACER L'HISTORIQUE ====================
  const clearHistory = () => {
    if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
      localStorage.removeItem('chatHistory');
      setHistory([]);
      console.log('🗑️ Historique effacé');
    }
  };

  // ==================== SUPPRIMER UNE CONVERSATION ====================
  const deleteConversation = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    console.log('🗑️ Conversation supprimée:', id);
  };

  // ==================== EXPORTER L'HISTORIQUE ====================
  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${Date.now()}.json`;
    link.click();
    console.log('📥 Historique exporté');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      
      {/* ==================== FORMULAIRE ==================== */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Posez votre question..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            marginBottom: '10px'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#61dafb',
            color: loading ? 'white' : '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      {/* ==================== RÉPONSE ACTUELLE ==================== */}
      {currentAnswer && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f0f8ff',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #007bff'
        }}>
          <strong>Réponse :</strong>
          <p style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
            {currentAnswer}
          </p>
        </div>
      )}

      {/* ==================== BOUTONS HISTORIQUE ==================== */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {showHistory ? '📕 Masquer' : '📖 Historique'} ({history.length})
        </button>

        {history.length > 0 && (
          <>
            <button
              onClick={exportHistory}
              style={{
                padding: '10px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              📥 Exporter
            </button>
            <button
              onClick={clearHistory}
              style={{
                padding: '10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🗑️ Effacer
            </button>
          </>
        )}
      </div>

      {/* ==================== AFFICHAGE HISTORIQUE ==================== */}
      {showHistory && (
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '15px',
          borderRadius: '8px',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          <h3>📚 Historique des conversations</h3>
          
          {history.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Aucune conversation enregistrée
            </p>
          ) : (
            history.slice().reverse().map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  position: 'relative'
                }}
              >
                <button
                  onClick={() => deleteConversation(item.id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ❌
                </button>

                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  📅 {item.date} à {item.time} | 🤖 {item.model}
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#007bff' }}>❓ Question :</strong>
                  <p style={{ marginTop: '5px' }}>{item.question}</p>
                </div>
                
                <div>
                  <strong style={{ color: '#28a745' }}>💬 Réponse :</strong>
                  <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>
                    {item.answer}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}